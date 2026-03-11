module.exports = {
  commands: {
    registerCommand: () => ({ dispose: () => {} }),
  },
  window: {
    showInformationMessage: () => {},
    showErrorMessage: () => {},
    showWarningMessage: () => {},
  },
  workspace: {
    getConfiguration: () => ({ get: () => {} }),
  },
  Uri: { file: (f) => f, parse: (s) => s },
  ExtensionContext: {},
};
