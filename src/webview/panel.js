const vscode = require('vscode');
const crypto = require('crypto');

/**
 * Webview panel example — singleton lifecycle with CSP + nonce.
 *
 * This module demonstrates the canonical VS Code Webview pattern:
 *   - enableScripts + locked-down localResourceRoots
 *   - Per-load nonce that gates inline <script> execution
 *   - Bidirectional messaging between extension host and webview
 *
 * Keep the message handler pure (accepts a postMessage callback) so it can be
 * unit-tested without spinning up the real Webview API.
 */

const VIEW_TYPE = 'my-extension.webviewPanel';
const VIEW_TITLE = 'My Extension';

let currentPanel;

/**
 * Generate a cryptographically-random nonce suitable for CSP.
 * @returns {string}
 */
function generateNonce() {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Build the CSP meta tag for the webview. Keep this tight — every relaxation
 * is an XSS vector. `cspSource` is the opaque origin VS Code mints per load.
 *
 * @param {string} cspSource webview.cspSource
 * @param {string} nonce per-load nonce
 * @returns {string} CSP policy string (value of the meta tag `content` attr)
 */
function buildCsp(cspSource, nonce) {
  return (
    `default-src 'none'; ` +
    `style-src ${cspSource} 'unsafe-inline'; ` +
    `script-src 'nonce-${nonce}';`
  );
}

/**
 * Render the webview HTML. Exposed for unit tests so CSP/nonce behavior can be
 * asserted without the real webview.
 *
 * @param {{ cspSource: string }} webview — the panel's Webview (or a stub with cspSource)
 * @param {string} nonce
 * @returns {string}
 */
function renderHtml(webview, nonce) {
  const csp = buildCsp(webview.cspSource, nonce);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="Content-Security-Policy" content="${csp}" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${VIEW_TITLE}</title>
    <style nonce="${nonce}">
      body { font-family: var(--vscode-font-family); padding: 1rem; color: var(--vscode-foreground); }
      button {
        background: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border: none; padding: 0.5rem 1rem; cursor: pointer;
      }
      button:hover { background: var(--vscode-button-hoverBackground); }
      pre { background: var(--vscode-textCodeBlock-background); padding: 0.75rem; overflow: auto; }
    </style>
  </head>
  <body>
    <h1>Webview example</h1>
    <p>Click the button to ask the extension host for workspace info.</p>
    <button id="ask">Get workspace info</button>
    <pre id="out">(no response yet)</pre>
    <script nonce="${nonce}">
      const vscode = acquireVsCodeApi();
      const out = document.getElementById('out');
      document.getElementById('ask').addEventListener('click', () => {
        vscode.postMessage({ type: 'getWorkspace' });
      });
      window.addEventListener('message', (event) => {
        const msg = event.data;
        if (msg && msg.type === 'workspace') {
          out.textContent = JSON.stringify(msg.data, null, 2);
        }
      });
    </script>
  </body>
</html>`;
}

/**
 * Pure message handler — decoupled from the real webview so tests can pass a
 * spy `postMessage`. Returns the response it posts (or null) for assertion.
 *
 * @param {{ type?: string }} message
 * @param {(payload: unknown) => void} postMessage
 * @param {typeof vscode.workspace} [workspaceApi]
 * @returns {unknown|null}
 */
function handleMessage(message, postMessage, workspaceApi = vscode.workspace) {
  if (!message || typeof message !== 'object') return null;
  if (message.type === 'getWorkspace') {
    const folders = (workspaceApi.workspaceFolders || []).map((f) => ({
      name: f.name,
      path: f.uri && (f.uri.fsPath || String(f.uri)),
    }));
    const response = {
      type: 'workspace',
      data: { name: workspaceApi.name || null, folders },
    };
    postMessage(response);
    return response;
  }
  return null;
}

/**
 * Create the panel or reveal the existing one.
 * @param {vscode.ExtensionContext} context
 */
function createOrShow(context) {
  const column = vscode.window.activeTextEditor
    ? vscode.window.activeTextEditor.viewColumn
    : undefined;

  if (currentPanel) {
    currentPanel.reveal(column);
    return currentPanel;
  }

  const panel = vscode.window.createWebviewPanel(VIEW_TYPE, VIEW_TITLE, column || 1, {
    enableScripts: true,
    localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'src', 'webview')],
    retainContextWhenHidden: false,
  });

  const nonce = generateNonce();
  panel.webview.html = renderHtml(panel.webview, nonce);

  panel.webview.onDidReceiveMessage(
    (message) => handleMessage(message, (payload) => panel.webview.postMessage(payload)),
    undefined,
    context.subscriptions
  );

  panel.onDidDispose(
    () => {
      if (currentPanel === panel) currentPanel = undefined;
    },
    null,
    context.subscriptions
  );

  currentPanel = panel;
  return panel;
}

/**
 * Register the command that opens the webview.
 * @param {vscode.ExtensionContext} context
 */
function registerShowWebview(context) {
  const disposable = vscode.commands.registerCommand('my-extension.showWebview', () => {
    createOrShow(context);
  });
  context.subscriptions.push(disposable);
}

module.exports = {
  registerShowWebview,
  createOrShow,
  renderHtml,
  buildCsp,
  generateNonce,
  handleMessage,
  // Exposed for tests that need to reset singleton state.
  __reset: () => {
    currentPanel = undefined;
  },
};
