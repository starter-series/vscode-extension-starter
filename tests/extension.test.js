const vscode = require('vscode');
const { activate, deactivate } = require('../src/extension');
const { registerHelloWorld } = require('../src/commands/helloWorld');
const pkg = require('../package.json');

/**
 * Builds a fresh ExtensionContext-like object for each test.
 * `subscriptions` mimics the disposable array VS Code provides to activate().
 */
function createContext() {
  return { subscriptions: [] };
}

beforeEach(() => {
  vscode.__reset();
});

describe('registerHelloWorld', () => {
  test('registers the command id declared in package.json', () => {
    const context = createContext();
    const declared = pkg.contributes.commands.find(
      (c) => c.command === 'my-extension.helloWorld'
    ).command;

    registerHelloWorld(context);

    expect(vscode.commands.registerCommand).toHaveBeenCalledTimes(1);
    expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
      declared,
      expect.any(Function)
    );
  });

  test('pushes the disposable onto context.subscriptions for cleanup', () => {
    const context = createContext();

    registerHelloWorld(context);

    expect(context.subscriptions).toHaveLength(1);
    expect(typeof context.subscriptions[0].dispose).toBe('function');
  });

  test('executing the command shows the hello world message', async () => {
    const context = createContext();
    registerHelloWorld(context);

    await vscode.commands.executeCommand('my-extension.helloWorld');

    expect(vscode.window.showInformationMessage).toHaveBeenCalledTimes(1);
    expect(vscode.window.showInformationMessage).toHaveBeenCalledWith(
      'Hello World from My Extension!'
    );
  });
});

describe('activate', () => {
  test('registers the helloWorld command on activation', async () => {
    const context = createContext();
    context.extensionUri = 'file:///fake/ext';

    activate(context);

    const registered = await vscode.commands.getCommands();
    expect(registered).toContain('my-extension.helloWorld');
    expect(registered).toContain('my-extension.showWebview');
    // One disposable per contributed command.
    expect(context.subscriptions).toHaveLength(2);
  });

  test('surfaces errors via showErrorMessage instead of throwing', () => {
    const context = createContext();
    // Force registerCommand to fail — mimics a broken VS Code host.
    vscode.commands.registerCommand.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    // activate() intentionally logs via console.error; silence it for clean output.
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    try {
      expect(() => activate(context)).not.toThrow();
      expect(vscode.window.showErrorMessage).toHaveBeenCalledTimes(1);
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        expect.stringContaining('boom')
      );
      expect(errSpy).toHaveBeenCalled();
    } finally {
      errSpy.mockRestore();
    }
  });
});

describe('deactivate', () => {
  test('is a no-op that returns undefined', () => {
    expect(deactivate()).toBeUndefined();
  });
});

describe('package.json contract', () => {
  test('every contributed command is backed by an activationEvent or is auto-activated', () => {
    // VS Code 1.74+ auto-activates contributed commands, but we still declare
    // explicit onCommand: entries for clarity. This guards against drift.
    const contributed = pkg.contributes.commands.map((c) => c.command);
    expect(contributed).toContain('my-extension.helloWorld');
    // If activationEvents are declared, ensure each contributed command has one.
    if (Array.isArray(pkg.activationEvents) && pkg.activationEvents.length > 0) {
      for (const cmd of contributed) {
        expect(pkg.activationEvents).toContain(`onCommand:${cmd}`);
      }
    }
  });
});
