/**
 * Minimal vscode API mock for unit tests.
 *
 * Uses jest.fn() so tests can assert on call arguments and invoke registered
 * command handlers. Keeps surface area narrow — extend only when a test needs it.
 */
const registeredCommands = new Map();

const commands = {
  registerCommand: jest.fn((id, handler) => {
    registeredCommands.set(id, handler);
    return { dispose: jest.fn(() => registeredCommands.delete(id)) };
  }),
  executeCommand: jest.fn((id, ...args) => {
    const handler = registeredCommands.get(id);
    if (!handler) {
      return Promise.reject(new Error(`Command not registered: ${id}`));
    }
    return Promise.resolve(handler(...args));
  }),
  getCommands: jest.fn(() => Promise.resolve([...registeredCommands.keys()])),
};

// Tracks the last webview panel created, so tests can introspect it.
let lastPanel = null;

function createWebviewPanelImpl(viewType, title, _column, _options) {
  const messageListeners = [];
  const disposeListeners = [];
  const webview = {
    cspSource: 'vscode-webview://mock',
    html: '',
    postMessage: jest.fn(() => Promise.resolve(true)),
    onDidReceiveMessage: jest.fn((listener) => {
      messageListeners.push(listener);
      return { dispose: jest.fn() };
    }),
  };
  const panel = {
    viewType,
    title,
    webview,
    visible: true,
    reveal: jest.fn(),
    dispose: jest.fn(() => {
      disposeListeners.forEach((l) => l());
    }),
    onDidDispose: jest.fn((listener) => {
      disposeListeners.push(listener);
      return { dispose: jest.fn() };
    }),
    // Test helpers — not part of the real Webview API.
    __fireMessage: (msg) => messageListeners.forEach((l) => l(msg)),
  };
  lastPanel = panel;
  return panel;
}

const window = {
  showInformationMessage: jest.fn(),
  showErrorMessage: jest.fn(),
  showWarningMessage: jest.fn(),
  activeTextEditor: undefined,
  createWebviewPanel: jest.fn(createWebviewPanelImpl),
};

const workspace = {
  getConfiguration: jest.fn(() => ({ get: jest.fn() })),
  name: undefined,
  workspaceFolders: undefined,
};

const Uri = {
  file: (f) => f,
  parse: (s) => s,
  joinPath: (base, ...parts) => ({ fsPath: [base, ...parts].join('/'), toString: () => [base, ...parts].join('/') }),
};

module.exports = {
  commands,
  window,
  workspace,
  Uri,
  ExtensionContext: {},
  // Exposed for test setup/teardown only — not part of the real vscode API.
  __reset: () => {
    registeredCommands.clear();
    commands.registerCommand.mockClear();
    commands.executeCommand.mockClear();
    commands.getCommands.mockClear();
    window.showInformationMessage.mockClear();
    window.showErrorMessage.mockClear();
    window.showWarningMessage.mockClear();
    window.createWebviewPanel.mockClear();
    window.activeTextEditor = undefined;
    workspace.getConfiguration.mockClear();
    workspace.name = undefined;
    workspace.workspaceFolders = undefined;
    lastPanel = null;
  },
  __getLastPanel: () => lastPanel,
};
