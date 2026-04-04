const vscode = require('vscode');
const { registerHelloWorld } = require('./commands/helloWorld');

/**
 * Called when the extension is activated.
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  try {
    registerHelloWorld(context);
  } catch (err) {
    vscode.window.showErrorMessage(`Extension activation failed: ${err.message}`);
    console.error('Activation error:', err);
  }
}

/**
 * Called when the extension is deactivated.
 */
function deactivate() {}

module.exports = { activate, deactivate };
