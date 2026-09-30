const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { findIssues } = require('../scripts/check-template-ready.cjs');

test('publish guard checks both metadata and registered command identifiers', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'extension-metadata-'));
  try {
    fs.mkdirSync(path.join(root, 'src'));
    const file = path.join(root, 'src', 'extension.js');
    const pkg = {
      name: 'sample-extension', publisher: 'sample-publisher',
      repository: 'https://github.com/sample/sample-extension',
      activationEvents: ['onCommand:sample-extension.hello'],
      contributes: { commands: [{ command: 'sample-extension.hello' }] },
    };
    fs.writeFileSync(file, "vscode.commands.registerCommand('sample-extension.hello', () => {});");
    expect(findIssues(pkg, root)).toEqual([]);
    fs.writeFileSync(file, "vscode.commands.registerCommand('my-extension.hello', () => {});");
    expect(findIssues(pkg, root).join('\n')).toMatch(/Replace my-extension/);
    fs.writeFileSync(file, "vscode.commands.registerCommand('sample-extension.other', () => {});");
    expect(findIssues(pkg, root).join('\n')).toMatch(/not contributed/);
    expect(findIssues({ ...pkg, name: 'my-extension', publisher: 'my-publisher' }, root).join('\n')).toMatch(/Replace publisher/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
