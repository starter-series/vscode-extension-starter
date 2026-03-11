<div align="center">

# VS Code Extension Starter

**Vanilla JS + GitHub Actions CI/CD + VS Marketplace & Open VSX deploy.**

Build your extension. Push to publish.

[![CI](https://github.com/heznpc/vscode-extension-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/heznpc/vscode-extension-starter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![VS Marketplace](https://img.shields.io/badge/VS_Marketplace-ready-blue.svg)](https://marketplace.visualstudio.com/)
[![Open VSX](https://img.shields.io/badge/Open_VSX-ready-purple.svg)](https://open-vsx.org/)

**English** | [한국어](README.ko.md)

</div>

---

## Quick Start

```bash
# 1. Click "Use this template" on GitHub (or clone)
git clone https://github.com/heznpc/vscode-extension-starter.git my-extension
cd my-extension

# 2. Install dependencies
npm install

# 3. Open in VS Code and press F5 to launch Extension Development Host

# 4. Open Command Palette (Ctrl+Shift+P) → "Hello World"
```

## What's Included

```
├── src/
│   ├── extension.js              # Main entry (activate/deactivate)
│   └── commands/
│       └── helloWorld.js         # Example command
├── test/
│   ├── __mocks__/
│   │   └── vscode.js            # VS Code API mock for Jest
│   └── extension.test.js        # Structure tests (Jest)
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                # Lint, test, package verification
│   │   ├── cd.yml                # Publish to VS Marketplace + Open VSX
│   │   └── setup.yml             # Auto setup checklist on first use
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   ├── MARKETPLACE_SETUP.md      # VS Marketplace PAT setup guide
│   └── OPENVSX_SETUP.md          # Open VSX token setup guide
├── scripts/
│   └── bump-version.js           # Semver version bumper
└── package.json                  # Extension manifest + scripts
```

## Features

- **Vanilla JS** — No build step, no TypeScript compilation, just JavaScript
- **CI Pipeline** — Security audit, lint, test, package build verification
- **CD Pipeline** — One-click publish to VS Marketplace + Open VSX + auto GitHub Release
- **Version management** — `npm run version:patch/minor/major` to bump `package.json`
- **Security** — CI runs `npm audit` on every push
- **Starter code** — Single command registration, easy to extend
- **Dual publishing** — VS Marketplace (VS Code) + Open VSX (VS Codium, Gitpod, etc.)
- **Template setup** — Auto-creates setup checklist issue on first use

## CI/CD

### CI (every PR + push to main)

| Step | What it does |
|------|-------------|
| Security audit | `npm audit` for dependency vulnerabilities |
| Lint | ESLint v9 flat config |
| Test | Jest (passes with no tests by default) |
| Package verification | Builds `.vsix` and verifies it succeeds |

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

1. Set up GitHub Secrets (see below)
2. Bump version: `npm run version:patch` (or `version:minor` / `version:major`)
3. Commit and push to `main`
4. Go to **Actions** tab → **Publish Extension** → **Run workflow**

### GitHub Secrets

| Secret | Workflow | Description |
|--------|----------|-------------|
| `VSCE_PAT` | `cd.yml` | VS Code Marketplace Personal Access Token |
| `OVSX_PAT` | `cd.yml` | Open VSX Registry access token |

See **[docs/MARKETPLACE_SETUP.md](docs/MARKETPLACE_SETUP.md)** for VS Marketplace setup.
See **[docs/OPENVSX_SETUP.md](docs/OPENVSX_SETUP.md)** for Open VSX setup.

## Development

```bash
# Launch Extension Development Host (in VS Code, press F5)

# Bump version (updates package.json)
npm run version:patch   # 0.1.0 → 0.1.1
npm run version:minor   # 0.1.0 → 0.2.0
npm run version:major   # 0.1.0 → 1.0.0

# Build .vsix package
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
