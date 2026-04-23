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

const window = {
  showInformationMessage: jest.fn(),
  showErrorMessage: jest.fn(),
  showWarningMessage: jest.fn(),
};

const workspace = {
  getConfiguration: jest.fn(() => ({ get: jest.fn() })),
};

module.exports = {
  commands,
  window,
  workspace,
  Uri: { file: (f) => f, parse: (s) => s },
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
    workspace.getConfiguration.mockClear();
  },
};
