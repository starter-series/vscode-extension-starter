const fs = require('node:fs');
const path = require('node:path');

function findIssues(pkg, root) {
  const issues = [];
  for (const [field, placeholder] of [['name', 'my-extension'], ['publisher', 'my-publisher']]) {
    if (!pkg[field]?.trim() || pkg[field] === placeholder) issues.push(`Replace ${field}: ${placeholder}`);
  }
  const repository = typeof pkg.repository === 'string' ? pkg.repository : pkg.repository?.url;
  if (!repository || /starter-series\/vscode-extension-starter|YOUR_/i.test(repository)) {
    issues.push('Set repository to your extension repository');
  }
  const commands = (pkg.contributes?.commands || []).map(({ command }) => command);
  for (const command of commands) {
    if (typeof command !== 'string' || !command.startsWith(`${pkg.name}.`)) {
      issues.push(`Command prefix must match name: ${command}`);
    }
  }
  for (const event of pkg.activationEvents || []) {
    if (event.startsWith('onCommand:') && !commands.includes(event.slice('onCommand:'.length))) {
      issues.push(`Activation command is not contributed: ${event}`);
    }
  }
  function scan(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) scan(file);
      else if (/\.[cm]?js$/.test(entry.name)) {
        const source = fs.readFileSync(file, 'utf8');
        if (source.includes('my-extension.')) issues.push(`Replace my-extension prefix in ${path.relative(root, file)}`);
        for (const match of source.matchAll(/registerCommand\(\s*['"]([^'"]+)['"]/g)) {
          if (!commands.includes(match[1])) issues.push(`Registered command is not contributed: ${match[1]}`);
        }
      }
    }
  }
  scan(path.join(root, 'src'));
  return issues;
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const issues = findIssues(JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')), root);
  if (issues.length) {
    console.error(`Template metadata is not ready to publish:\n- ${issues.join('\n- ')}`);
    process.exitCode = 1;
  } else console.log('Template metadata is ready to publish.');
}

module.exports = { findIssues };
