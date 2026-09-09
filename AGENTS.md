# VS Code Extension Starter

Vanilla JS VS Code extension with dual publishing to VS Marketplace + Open VSX.

## Project Structure

```
src/
  extension.js      → Extension entry point (activate/deactivate)
  commands/          → Command implementations
    helloWorld.js    → Example command
scripts/
  bump-version.js   → Version bumping
tests/
  __mocks__/vscode.js → VS Code API mock for Jest
docs/
  MARKETPLACE_SETUP.md → VS Marketplace PAT setup
  OPENVSX_SETUP.md     → Open VSX token setup
```

## CI/CD Pipeline

- **ci.yml**: Push/PR to main. npm audit + ESLint + Jest + vsce package (build verification). No secrets.
- **cd.yml**: Manual trigger. CI gate → vsce publish (Marketplace) → ovsx publish (Open VSX, optional) → GitHub Release with .vsix.
- **setup.yml**: First push only. Creates setup checklist Issue.

## Secrets

| Secret | Required | Purpose |
|--------|----------|---------|
| `VSCE_PAT` | Yes | VS Marketplace Personal Access Token |
| `OVSX_PAT` | No | Open VSX token (skipped gracefully if not set) |

## What to Modify

- `src/commands/` → Add your commands (one file per command)
- `src/extension.js` → Register commands in activate()
- `package.json` → Update ALL of these together:
  - `name` → Extension ID (lowercase, hyphens)
  - `displayName` → Human-readable name
  - `description` → Extension description
  - `publisher` → Your VS Marketplace publisher ID
  - `contributes.commands[].command` → Must match `name` prefix (e.g., `my-ext.commandName`)
  - `repository.url` → Your repo URL
- Version → `npm run version:patch|minor|major`

## Do NOT Modify

- `tests/__mocks__/vscode.js`
  - **Why**: `vscode` 모듈은 Extension Host에서만 존재. Jest에서 테스트하려면 이 mock이 필수. 삭제하면 모든 테스트가 import 에러로 실패.
- CD workflow publish logic (vsce → ovsx 순서)
  - **Why**: VS Marketplace가 primary. Open VSX는 optional (OVSX_PAT 없으면 skip). 순서 변경 시 Marketplace 배포 실패해도 Open VSX에 올라가는 불일치 발생.
- `--no-dependencies` flag in package script
  - **Why**: VS Code 확장은 node_modules를 번들하지 않음. 이 플래그 없으면 vsce가 모든 devDeps를 .vsix에 포함해서 패키지가 수십 MB로 부풀어짐.
- Version guard logic
  - **Why**: 같은 버전으로 Marketplace에 publish하면 덮어쓰기됨. 의도치 않은 롤백 방지.

## Important: Command Prefix Sync

Command IDs in `package.json` contributes and source files must match:
```
package.json:  "command": "my-extension.helloWorld"
                            ^^^^^^^^^^^^
src/commands/helloWorld.js  (registered with same ID in extension.js)
```
When renaming the extension, update the command prefix in BOTH places.

## Key Patterns

- No bundler — VS Code loads JS files directly
- `vsce package --no-dependencies` builds .vsix without node_modules
- Open VSX publish is optional (graceful skip if OVSX_PAT not set)
- Jest uses vscode mock (`tests/__mocks__/vscode.js`) since vscode module only exists in Extension Host
- Zero runtime dependencies

## Fleet CI policy

Common runtime, audit, license, secret-scan and CodeQL policy lives in
[starter-series/.github](https://github.com/starter-series/.github).
Keep deliverable checks in `.github/actions/validate/action.yml`.
Weekly health and failures are aggregated in the central Fleet maintenance workflow;
this repository retains a manual maintenance runner without issue automation.
