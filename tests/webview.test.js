const vscode = require('vscode');
const {
  renderHtml,
  buildCsp,
  generateNonce,
  handleMessage,
  registerShowWebview,
  createOrShow,
  __reset: resetPanel,
} = require('../src/webview/panel');
const pkg = require('../package.json');

function createContext() {
  return { subscriptions: [], extensionUri: 'file:///fake/ext' };
}

beforeEach(() => {
  vscode.__reset();
  resetPanel();
});

describe('generateNonce', () => {
  test('produces distinct values across calls', () => {
    const a = generateNonce();
    const b = generateNonce();
    expect(a).not.toBe(b);
    // base64 of 16 bytes -> 24 chars including padding
    expect(a).toMatch(/^[A-Za-z0-9+/=]+$/);
    expect(a.length).toBeGreaterThanOrEqual(22);
  });
});

describe('buildCsp', () => {
  test('interpolates cspSource and nonce and locks default-src to none', () => {
    const csp = buildCsp('vscode-webview://abc', 'N0NCE');
    expect(csp).toContain("default-src 'none'");
    expect(csp).toContain('style-src vscode-webview://abc');
    expect(csp).toContain("script-src 'nonce-N0NCE'");
    // Sanity: no wildcard that would defeat CSP.
    expect(csp).not.toContain("script-src *");
    expect(csp).not.toContain("'unsafe-eval'");
  });
});

describe('renderHtml', () => {
  test('embeds CSP meta, cspSource, and the provided nonce', () => {
    const webview = { cspSource: 'vscode-webview://abc' };
    const html = renderHtml(webview, 'NONCE-A');
    expect(html).toContain('<meta http-equiv="Content-Security-Policy"');
    expect(html).toContain("default-src 'none'");
    expect(html).toContain('vscode-webview://abc');
    expect(html).toContain('nonce-NONCE-A');
    // Every script tag must carry the nonce — inline scripts without it are blocked.
    // Case-insensitive regex: CodeQL js/bad-tag-filter flags case-sensitive HTML regexes
    // because HTML tag names are case-insensitive in browsers.
    const scriptOpenTags = html.match(/<script\b[^>]*>/gi) || [];
    expect(scriptOpenTags.length).toBeGreaterThan(0);
    for (const tag of scriptOpenTags) {
      expect(tag).toContain('nonce="NONCE-A"');
    }
  });

  test('uses a fresh nonce each call when driven by generateNonce', () => {
    const webview = { cspSource: 'vscode-webview://x' };
    const a = renderHtml(webview, generateNonce());
    const b = renderHtml(webview, generateNonce());
    expect(a).not.toBe(b);
  });
});

describe('handleMessage', () => {
  test('getWorkspace returns a workspace response with name + folders', () => {
    const post = jest.fn();
    const response = handleMessage(
      { type: 'getWorkspace' },
      post,
      {
        name: 'demo.code-workspace',
        workspaceFolders: [{ name: 'repo', uri: { fsPath: '/tmp/repo' } }],
      }
    );
    expect(post).toHaveBeenCalledTimes(1);
    expect(response).toEqual({
      type: 'workspace',
      data: {
        name: 'demo.code-workspace',
        folders: [{ name: 'repo', path: '/tmp/repo' }],
      },
    });
    expect(post).toHaveBeenCalledWith(response);
  });

  test('handles missing workspaceFolders gracefully', () => {
    const post = jest.fn();
    const response = handleMessage({ type: 'getWorkspace' }, post, {});
    expect(response).toEqual({ type: 'workspace', data: { name: null, folders: [] } });
  });

  test('ignores unknown message types without posting', () => {
    const post = jest.fn();
    const response = handleMessage({ type: 'unknown' }, post, {});
    expect(response).toBeNull();
    expect(post).not.toHaveBeenCalled();
  });

  test('ignores malformed messages', () => {
    const post = jest.fn();
    expect(handleMessage(null, post, {})).toBeNull();
    expect(handleMessage('string', post, {})).toBeNull();
    expect(post).not.toHaveBeenCalled();
  });
});

describe('registerShowWebview + createOrShow', () => {
  test('registers the command declared in package.json', () => {
    const context = createContext();
    const declared = pkg.contributes.commands.find(
      (c) => c.command === 'my-extension.showWebview'
    );
    expect(declared).toBeDefined();

    registerShowWebview(context);

    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      'my-extension.showWebview',
      expect.any(Function)
    );
    expect(context.subscriptions).toHaveLength(1);
  });

  test('executing the command creates a webview panel with locked-down options', async () => {
    const context = createContext();
    registerShowWebview(context);

    await vscode.commands.executeCommand('my-extension.showWebview');

    expect(vscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
    const [, , , options] = vscode.window.createWebviewPanel.mock.calls[0];
    expect(options.enableScripts).toBe(true);
    expect(Array.isArray(options.localResourceRoots)).toBe(true);
    expect(options.localResourceRoots).toHaveLength(1);
  });

  test('reuses the existing panel instead of creating a second one', () => {
    const context = createContext();
    const first = createOrShow(context);
    const second = createOrShow(context);
    expect(second).toBe(first);
    expect(vscode.window.createWebviewPanel).toHaveBeenCalledTimes(1);
    expect(first.reveal).toHaveBeenCalled();
  });

  test('disposing the panel clears the singleton so the next call recreates', () => {
    const context = createContext();
    const first = createOrShow(context);
    first.dispose(); // fires onDidDispose listeners
    const second = createOrShow(context);
    expect(second).not.toBe(first);
    expect(vscode.window.createWebviewPanel).toHaveBeenCalledTimes(2);
  });

  test('webview messages flow through to postMessage', () => {
    const context = createContext();
    vscode.workspace.name = 'demo';
    vscode.workspace.workspaceFolders = [{ name: 'r', uri: { fsPath: '/r' } }];
    const panel = createOrShow(context);

    panel.__fireMessage({ type: 'getWorkspace' });

    expect(panel.webview.postMessage).toHaveBeenCalledWith({
      type: 'workspace',
      data: { name: 'demo', folders: [{ name: 'r', path: '/r' }] },
    });
  });
});

describe('package.json contract (webview command)', () => {
  test('showWebview has an activationEvent', () => {
    expect(pkg.contributes.commands.map((c) => c.command)).toContain(
      'my-extension.showWebview'
    );
    expect(pkg.activationEvents).toContain('onCommand:my-extension.showWebview');
  });
});
