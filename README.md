<div align="center">

# VS Code Extension Starter

**Vanilla JS + GitHub Actions CI/CD + VS Marketplace & Open VSX deploy.**

Build your extension. Push to publish.

[![CI](https://github.com/starter-series/vscode-extension-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/starter-series/vscode-extension-starter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![VS Marketplace](https://img.shields.io/badge/VS_Marketplace-ready-blue.svg)](https://marketplace.visualstudio.com/)
[![Open VSX](https://img.shields.io/badge/Open_VSX-ready-purple.svg)](https://open-vsx.org/)

**English** | [한국어](README.ko.md)

</div>

---

> **Part of [Starter Series](https://github.com/starter-series/starter-series)** — Stop explaining CI/CD to your AI every time. Clone and start.
>
> [Docker Deploy](https://github.com/starter-series/docker-deploy-starter) · [Discord Bot](https://github.com/starter-series/discord-bot-starter) · [Telegram Bot](https://github.com/starter-series/telegram-bot-starter) · [Browser Extension](https://github.com/starter-series/browser-extension-starter) · [Electron App](https://github.com/starter-series/electron-app-starter) · [npm Package](https://github.com/starter-series/npm-package-starter) · [React Native](https://github.com/starter-series/react-native-starter) · **VS Code Extension** · [MCP Server](https://github.com/starter-series/mcp-server-starter) · [Python MCP Server](https://github.com/starter-series/python-mcp-server-starter) · [Cloudflare Pages](https://github.com/starter-series/cloudflare-pages-starter)

---

## Quick Start

**Via [create-starter](https://github.com/starter-series/create-starter)** (recommended):

```bash
gh repo create my-vscode-extension --template starter-series/vscode-extension-starter --clone
cd my-vscode-extension && npm install
npm run build
# Open in VS Code and press F5 to launch Extension Development Host
```

**Or clone directly:**

```bash
git clone https://github.com/starter-series/vscode-extension-starter my-vscode-extension
cd my-vscode-extension && npm install
npm run build
# Open in VS Code and press F5
```

Then open Command Palette (`Ctrl+Shift+P`) → **Hello World** or **Show Webview Panel**.

---

## Currently implemented

Everything below is backed by code on disk and exercised by Jest (40 tests passing, 100% statement coverage).

- **Vanilla JS extension scaffold** — `src/extension.js` (activate/deactivate), `src/commands/helloWorld.js` (command example), `src/webview/panel.js` (CSP + nonce + bidirectional messaging).
- **CI pipeline** (`.github/workflows/ci.yml`) — `npm audit`, ESLint v9 flat config, Jest with coverage gate, `vsce package` build verification.
- **CD pipeline** (`.github/workflows/cd.yml`) — version-tag guard, `vsce publish` to VS Marketplace, `ovsx publish` to Open VSX, GitHub Release with `.vsix` attached, manual trigger via Actions tab.
- **Supply-chain hardening** — `npm ci --ignore-scripts` across CI/CD, pinned gitleaks 8.30.1 with sha256 checksum verification, CodeQL on push/PR + weekly, Dependabot for npm + actions.
- **Webview security defaults** — `default-src 'none'`, per-load `crypto.randomBytes(16)` nonce, `localResourceRoots` scoped to `src/webview/`, `enableScripts` panel-local.
- **Version bumper** — `scripts/bump-version.js` exposed as `npm run version:patch|minor|major`.
- **Maintenance workflows** — weekly CI health check (auto-issues on failure), stale bot (30d label → 7d close).

```
├── src/
│   ├── extension.js              # Main entry (activate/deactivate)
│   ├── commands/helloWorld.js    # Example command
│   └── webview/panel.js          # Webview panel (CSP + nonce + messaging)
├── tests/
│   ├── __mocks__/vscode.js       # VS Code API mock for Jest
│   ├── bump-version.test.js
│   ├── extension.test.js
│   ├── overrides-regression.test.js
│   └── webview.test.js
├── .github/workflows/
│   ├── ci.yml                    # Lint, test, package verification
│   ├── cd.yml                    # Publish to VS Marketplace + Open VSX
│   ├── codeql.yml                # Static security analysis
│   ├── maintenance.yml           # Weekly CI health check
│   └── stale.yml                 # Inactive issue/PR janitor
├── docs/
│   ├── MARKETPLACE_SETUP.md      # VS Marketplace PAT setup
│   └── OPENVSX_SETUP.md          # Open VSX token setup
└── scripts/bump-version.js       # Semver version bumper
```

## Planned

- None on the public roadmap. This starter is feature-complete for its scope.

## Design intent

- **Vanilla JS, zero build step.** LLMs generate clean JavaScript directly; a TypeScript + bundler stack forces the model to also reason about `tsconfig.json`, `outDir`, source maps, and bundler entry points before the extension can even be tested. Removing those layers shortens the iteration loop.
- **Dual publishing (VS Marketplace + Open VSX) baked in, not bolted on.** Open VSX is the only registry available to VS Codium, Gitpod, and Coder users. A starter that publishes to only one registry quietly excludes that audience.
- **Webview as a unit-testable pure function.** `src/webview/panel.js` exports the message handler separately from VS Code API binding, so it can be tested without mocking the `Webview` object. This is the pattern most starters skip.
- **CI/CD assumes the secret will be missing on first run.** Both publish steps are conditional on the secret existing — the template is safe to fork without immediately breaking CD.
- **Security is the default, not a checklist item.** `--ignore-scripts`, sha256-pinned gitleaks, CodeQL, `npm audit` on every push, and webview CSP with nonce are all turned on out of the box.

## Non-goals

- **No TypeScript by default.** If you need it, the [README section below](#what-about-typescript) shows the four-step opt-in. Forcing TS on every fork would defeat the zero-build-step philosophy.
- **No webpack / esbuild / Rollup.** Extensions that genuinely need bundling can add it; most don't.
- **No `@vscode/test-electron`.** Jest with a `vscode` API mock covers structural and unit-level tests without the cost of spinning up an Electron host on every PR. Integration-level VS Code testing is out of scope for the starter; it belongs in projects that need it.
- **No marketplace-listing assets.** Icon, banner, gallery screenshots, and the long-form description are author choices and should not be templated.
- **No telemetry, no analytics, no remote config.** A starter shouldn't ship phone-home behavior to forks.

## Redacted

- None.

---

## CI/CD

### CI (every PR + push to main)

| Step | What it does |
|------|-------------|
| Security audit | `npm audit` for dependency vulnerabilities |
| Lint | ESLint v9 flat config |
| Test | Jest with coverage gate |
| Build / package verification | Runs `npm run build` / `vsce package` and verifies `.vsix` succeeds |

### Security & Maintenance

| Workflow | What it does |
|----------|-------------|
| CodeQL (`codeql.yml`) | Static analysis for security vulnerabilities (push/PR + weekly) |
| Maintenance (`maintenance.yml`) | Weekly CI health check — auto-creates issue on failure |
| Stale (`stale.yml`) | Labels inactive issues/PRs after 30 days, auto-closes after 7 more |

### CD (manual trigger via Actions tab)

| Step | What it does |
|------|-------------|
| CI | Runs full CI pipeline first |
| Version guard | Fails if git tag already exists for this version |
| Build | `vsce package` to create `.vsix` |
| VS Marketplace | `vsce publish` to VS Code Marketplace |
| Open VSX | `ovsx publish` to Open VSX Registry |
| GitHub Release | Creates a tagged release with `.vsix` attached |
| Artifact | Saves `.vsix` as GitHub Actions artifact |

**How to deploy:**

1. Set up GitHub Secrets (see below).
2. Bump version: `npm run version:patch` (or `version:minor` / `version:major`).
3. Commit and push to `main`.
4. Go to **Actions** → **Publish Extension** → **Run workflow**.

### GitHub Secrets

| Secret | Workflow | Description |
|--------|----------|-------------|
| `VSCE_PAT` | `cd.yml` | VS Code Marketplace Personal Access Token |
| `OVSX_PAT` | `cd.yml` | Open VSX Registry access token |

See **[docs/MARKETPLACE_SETUP.md](docs/MARKETPLACE_SETUP.md)** for VS Marketplace setup.
See **[docs/OPENVSX_SETUP.md](docs/OPENVSX_SETUP.md)** for Open VSX setup.

## Webview example

Open Command Palette (`Ctrl+Shift+P`) and run **My Extension: Show Webview Panel** (command id `my-extension.showWebview`). The panel demonstrates a minimal, production-ready pattern for building UI inside VS Code.

**Security defaults baked in:**

- `default-src 'none'` — nothing loads unless explicitly allowed
- Per-load nonce generated with `crypto.randomBytes(16)` — inline scripts without it are blocked
- `localResourceRoots` limited to `src/webview/` — the webview cannot read arbitrary files
- `enableScripts: true` scoped to this panel only

**Bidirectional messaging** — extension host ↔ webview:

```js
// Webview side (inline <script nonce="...">)
const vscode = acquireVsCodeApi();
document.getElementById('ask').addEventListener('click', () => {
  vscode.postMessage({ type: 'getWorkspace' });
});

// Extension side (src/webview/panel.js)
panel.webview.onDidReceiveMessage((message) => {
  if (message.type === 'getWorkspace') {
    panel.webview.postMessage({ type: 'workspace', data: { /* ... */ } });
  }
});
```

The message handler in `src/webview/panel.js` is a pure function that accepts a `postMessage` callback, so it's unit-testable without the real Webview API. See [`tests/webview.test.js`](tests/webview.test.js).

Full docs: [VS Code Webview API guide](https://code.visualstudio.com/api/extension-guides/webview).

## Development

```bash
# Launch Extension Development Host (in VS Code, press F5)

# Bump version (updates package.json)
npm run version:patch   # 0.1.0 → 0.1.1
npm run version:minor   # 0.1.0 → 0.2.0
npm run version:major   # 0.1.0 → 1.0.0

# Build .vsix package
npm run build
npm run package

# Lint & test
npm run lint
npm test
```

## Why This Over Yeoman / create-vscode-ext?

The [Yeoman VS Code generator](https://github.com/Microsoft/vscode-generator-code) is the official scaffolding tool. This template takes a different approach:

|  | This template | Yeoman generator |
|---|---|---|
| Philosophy | Thin starter with CI/CD | Scaffolding without CI/CD |
| Build system | None (vanilla JS) | TypeScript compilation (default) |
| CI/CD | Full pipeline included | Not included |
| Dependencies | 6 dev, 0 runtime | 10+ dev |
| Dual publishing | VS Marketplace + Open VSX | Not included |
| AI/vibe-coding | LLMs generate clean vanilla JS | LLMs must handle TS + bundler config |

**Choose this template if:**
- You want production CI/CD out of the box
- You prefer vanilla JavaScript without a build step
- You need dual publishing (VS Marketplace + Open VSX)
- You're using AI tools to generate extension code

**Choose Yeoman if:**
- You want TypeScript with full type checking
- You need the official VS Code testing framework (`@vscode/test-electron`)
- You want webpack/esbuild bundling built in

### What about TypeScript?

This template intentionally uses vanilla JavaScript to keep the zero-build-step philosophy. If you need TypeScript:

1. Add `typescript` to devDependencies
2. Add a `tsconfig.json`
3. Add a `tsc` build step to `package.json`
4. Rename `.js` files to `.ts`

This keeps TypeScript opt-in rather than forcing a build pipeline on everyone.

## Contributing

PRs welcome. Please use the [PR template](.github/PULL_REQUEST_TEMPLATE.md).

## License

[MIT](LICENSE)
