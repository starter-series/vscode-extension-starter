<div align="center">

# VS Code Extension Starter

**Vanilla JS + GitHub Actions CI/CD + VS Marketplace & Open VSX 배포.**

확장을 만들고, push로 배포하세요.

[![CI](https://github.com/starter-series/vscode-extension-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/starter-series/vscode-extension-starter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![VS Marketplace](https://img.shields.io/badge/VS_Marketplace-ready-blue.svg)](https://marketplace.visualstudio.com/)
[![Open VSX](https://img.shields.io/badge/Open_VSX-ready-purple.svg)](https://open-vsx.org/)

[English](README.md) | **한국어**

</div>

---

> **[Starter Series](https://github.com/starter-series/starter-series)** — 매번 AI한테 CI/CD 설명하지 마세요. clone하고 바로 시작하세요.
>
> [Docker Deploy](https://github.com/starter-series/docker-deploy-starter) · [Discord Bot](https://github.com/starter-series/discord-bot-starter) · [Telegram Bot](https://github.com/starter-series/telegram-bot-starter) · [Browser Extension](https://github.com/starter-series/browser-extension-starter) · [Electron App](https://github.com/starter-series/electron-app-starter) · [npm Package](https://github.com/starter-series/npm-package-starter) · [React Native](https://github.com/starter-series/react-native-starter) · **VS Code Extension** · [MCP Server](https://github.com/starter-series/mcp-server-starter) · [Python MCP Server](https://github.com/starter-series/python-mcp-server-starter) · [Cloudflare Pages](https://github.com/starter-series/cloudflare-pages-starter)

---

## 빠른 시작

**[create-starter](https://github.com/starter-series/create-starter) 사용** (권장):

```bash
npx @starter-series/create my-vscode-extension --template vscode-extension
cd my-vscode-extension && npm install
npm run build
# VS Code에서 열고 F5를 눌러 Extension Development Host 실행
```

**또는 직접 clone:**

```bash
git clone https://github.com/starter-series/vscode-extension-starter my-vscode-extension
cd my-vscode-extension && npm install
npm run build
# VS Code에서 열고 F5
```

그 다음 명령 팔레트(`Ctrl+Shift+P`)에서 **Hello World** 또는 **Show Webview Panel** 실행.

---

## 현재 구현됨 (Currently implemented)

아래 항목은 모두 디스크상의 코드로 뒷받침되며, Jest로 검증됩니다 (40개 테스트 통과, statement 커버리지 100%).

- **Vanilla JS 확장 스캐폴드** — `src/extension.js` (activate/deactivate), `src/commands/helloWorld.js` (커맨드 예제), `src/webview/panel.js` (CSP + nonce + 양방향 메시징).
- **CI 파이프라인** (`.github/workflows/ci.yml`) — `npm audit`, ESLint v9 flat config, Jest 커버리지 게이트, `vsce package` 빌드 검증.
- **CD 파이프라인** (`.github/workflows/cd.yml`) — 버전 태그 가드, `vsce publish`로 VS Marketplace 배포, `ovsx publish`로 Open VSX 배포, `.vsix` 첨부된 GitHub Release, Actions 탭에서 수동 트리거.
- **공급망 보안** — CI/CD 전반에 `npm ci --ignore-scripts` 적용, gitleaks 8.30.1을 sha256 체크섬 검증과 함께 핀, push/PR + 주간 CodeQL, npm + actions Dependabot.
- **Webview 보안 기본값** — `default-src 'none'`, `crypto.randomBytes(16)`로 per-load nonce, `localResourceRoots`를 `src/webview/`로 제한, `enableScripts`는 패널 단위로만 활성화.
- **버전 범퍼** — `scripts/bump-version.js`가 `npm run version:patch|minor|major`로 노출됨.
- **유지보수 워크플로우** — 주간 CI 헬스 체크 (실패 시 이슈 자동 생성), stale 봇 (30일 라벨 → 7일 후 자동 종료).

```
├── src/
│   ├── extension.js              # 메인 진입점 (activate/deactivate)
│   ├── commands/helloWorld.js    # 예제 커맨드
│   └── webview/panel.js          # Webview 패널 (CSP + nonce + 메시징)
├── tests/
│   ├── __mocks__/vscode.js       # Jest용 VS Code API 모의 객체
│   ├── bump-version.test.js
│   ├── extension.test.js
│   ├── overrides-regression.test.js
│   └── webview.test.js
├── .github/workflows/
│   ├── ci.yml                    # 린트, 테스트, 패키지 검증
│   ├── cd.yml                    # VS Marketplace + Open VSX 배포
│   ├── codeql.yml                # 정적 보안 분석
│   ├── maintenance.yml           # 주간 CI 헬스 체크
│   └── stale.yml                 # 비활성 이슈/PR 정리
├── docs/
│   ├── MARKETPLACE_SETUP.md      # VS Marketplace PAT 설정
│   └── OPENVSX_SETUP.md          # Open VSX 토큰 설정
└── scripts/bump-version.js       # Semver 버전 범퍼
```

## 계획됨 (Planned)

- 공개 로드맵에 등록된 항목은 없습니다. 이 스타터는 스코프 범위 내에서 기능적으로 완성된 상태입니다.

## 설계 의도 (Design intent)

- **Vanilla JS, 빌드 단계 없음.** LLM이 JavaScript를 바로 생성합니다. TypeScript + 번들러 스택을 강제하면 모델이 확장을 테스트하기도 전에 `tsconfig.json`, `outDir`, 소스맵, 번들러 entry point까지 함께 다뤄야 합니다. 이 레이어를 없애 반복 주기를 짧게 유지합니다.
- **VS Marketplace + Open VSX 듀얼 퍼블리싱은 옵션이 아니라 기본값.** Open VSX는 VS Codium, Gitpod, Coder 사용자가 접근 가능한 유일한 레지스트리입니다. 한 곳에만 배포하는 스타터는 그 사용자층을 조용히 배제합니다.
- **Webview를 유닛 테스트 가능한 순수 함수로 분리.** `src/webview/panel.js`는 메시지 핸들러를 VS Code API 바인딩에서 분리해 export하므로, `Webview` 객체를 모의(mock)하지 않고도 테스트 가능합니다. 대부분의 스타터가 생략하는 패턴입니다.
- **CI/CD는 시크릿이 없는 첫 실행을 가정.** 두 publish 단계 모두 시크릿 존재 여부에 따라 조건부 실행됩니다. 포크 직후 CD가 즉시 깨지지 않도록 설계되었습니다.
- **보안은 체크리스트 항목이 아니라 기본값.** `--ignore-scripts`, sha256 핀 gitleaks, CodeQL, 매 push `npm audit`, nonce 기반 webview CSP 모두 박스 오픈 상태에서 활성화되어 있습니다.

## 제외 대상 (Non-goals)

- **TypeScript를 기본으로 강제하지 않습니다.** 필요하면 아래 [README 섹션](#typescript는)에 4단계 opt-in 방법이 있습니다. 모든 포크에 TS를 강제하면 빌드 단계 없는 철학이 무너집니다.
- **webpack / esbuild / Rollup 없음.** 번들링이 정말 필요한 확장은 직접 추가하면 되며, 대부분은 필요하지 않습니다.
- **`@vscode/test-electron` 없음.** Jest + `vscode` API 모의 객체로 구조/유닛 수준 테스트를 커버하며, 매 PR마다 Electron 호스트를 띄우는 비용을 부담하지 않습니다. 통합 수준 VS Code 테스트는 스타터의 스코프 바깥이며, 필요한 프로젝트가 별도로 구성할 영역입니다.
- **마켓플레이스 리스팅 자산 없음.** 아이콘, 배너, 갤러리 스크린샷, 장문 설명은 저자의 선택이며 템플릿화하지 않습니다.
- **텔레메트리 / 분석 / 원격 설정 없음.** 스타터가 포크에 phone-home 동작을 심으면 안 됩니다.

## 비공개 (Redacted)

- 해당 사항 없음.

---

## CI/CD

### CI (모든 PR + main push 시)

| 단계 | 역할 |
|------|------|
| 보안 감사 | `npm audit`로 의존성 취약점 확인 |
| 린트 | ESLint v9 flat config |
| 테스트 | Jest 커버리지 게이트 |
| 빌드 / 패키지 검증 | `npm run build` / `vsce package`로 `.vsix` 성공 여부 확인 |

### 보안 & 유지보수

| 워크플로우 | 역할 |
|-----------|------|
| CodeQL (`codeql.yml`) | 보안 취약점 정적 분석 (push/PR + 주간) |
| Maintenance (`maintenance.yml`) | 주간 CI 헬스 체크 — 실패 시 이슈 자동 생성 |
| Stale (`stale.yml`) | 비활성 이슈/PR 30일 후 라벨링, 7일 후 자동 종료 |

### CD (Actions 탭에서 수동 실행)

| 단계 | 역할 |
|------|------|
| CI | 전체 CI 파이프라인 먼저 실행 |
| 버전 가드 | 해당 버전의 git 태그가 이미 있으면 실패 |
| 빌드 | `vsce package`로 `.vsix` 생성 |
| VS Marketplace | `vsce publish`로 VS Code Marketplace에 배포 |
| Open VSX | `ovsx publish`로 Open VSX Registry에 배포 |
| GitHub Release | 태그 생성 + `.vsix` 첨부된 릴리즈 자동 생성 |
| 아티팩트 | `.vsix`를 GitHub Actions 아티팩트로 저장 |

**배포 방법:**

1. GitHub Secrets 설정 (아래 참조).
2. 버전 업: `npm run version:patch` (또는 `version:minor` / `version:major`).
3. 커밋하고 `main`에 push.
4. **Actions** 탭 → **Publish Extension** → **Run workflow**.

### GitHub Secrets

| Secret | Workflow | 설명 |
|--------|----------|------|
| `VSCE_PAT` | `cd.yml` | VS Code Marketplace Personal Access Token |
| `OVSX_PAT` | `cd.yml` | Open VSX Registry 액세스 토큰 |

자세한 설정 방법은 **[docs/MARKETPLACE_SETUP.md](docs/MARKETPLACE_SETUP.md)** (VS Marketplace)와 **[docs/OPENVSX_SETUP.md](docs/OPENVSX_SETUP.md)** (Open VSX)를 참고하세요.

## Webview 예제

명령 팔레트(`Ctrl+Shift+P`)에서 **My Extension: Show Webview Panel** 실행 (command id `my-extension.showWebview`). VS Code 내부에 UI를 만드는 최소 프로덕션 패턴을 보여줍니다.

**내장된 보안 기본값:**

- `default-src 'none'` — 명시적으로 허용한 것만 로드
- `crypto.randomBytes(16)`로 per-load nonce 생성 — nonce 없는 인라인 스크립트는 차단
- `localResourceRoots`를 `src/webview/`로 제한 — 임의 파일 읽기 불가
- `enableScripts: true`는 이 패널에만 적용

**양방향 메시징** — extension host ↔ webview:

```js
// Webview 쪽 (nonce가 있는 inline <script>)
const vscode = acquireVsCodeApi();
document.getElementById('ask').addEventListener('click', () => {
  vscode.postMessage({ type: 'getWorkspace' });
});

// Extension 쪽 (src/webview/panel.js)
panel.webview.onDidReceiveMessage((message) => {
  if (message.type === 'getWorkspace') {
    panel.webview.postMessage({ type: 'workspace', data: { /* ... */ } });
  }
});
```

`src/webview/panel.js`의 메시지 핸들러는 `postMessage` 콜백을 인자로 받는 순수 함수라, 실제 Webview API 없이도 유닛 테스트 가능합니다. [`tests/webview.test.js`](tests/webview.test.js) 참고.

공식 문서: [VS Code Webview API 가이드](https://code.visualstudio.com/api/extension-guides/webview).

## 개발

```bash
# Extension Development Host 실행 (VS Code에서 F5)

# 버전 업 (package.json 자동 업데이트)
npm run version:patch   # 0.1.0 → 0.1.1
npm run version:minor   # 0.1.0 → 0.2.0
npm run version:major   # 0.1.0 → 1.0.0

# .vsix 패키지 빌드
npm run build
npm run package

# 린트 & 테스트
npm run lint
npm test
```

## Yeoman / create-vscode-ext 대신 이걸 쓰는 이유

[Yeoman VS Code generator](https://github.com/Microsoft/vscode-generator-code)는 공식 스캐폴딩 도구입니다. 이 템플릿은 근본적으로 다른 접근입니다:

|  | 이 템플릿 | Yeoman generator |
|---|---|---|
| 철학 | CI/CD를 갖춘 가벼운 스타터 | CI/CD 없는 스캐폴딩 |
| 빌드 시스템 | 없음 (vanilla JS) | TypeScript 컴파일 (기본) |
| CI/CD | 풀 파이프라인 포함 | 미포함 |
| 의존성 | dev 6개, runtime 0개 | 10개+ dev |
| 듀얼 퍼블리싱 | VS Marketplace + Open VSX | 미포함 |
| AI/바이브코딩 | LLM이 깔끔한 vanilla JS 생성 | LLM이 TS + 번들러 설정을 이해해야 함 |

**이 템플릿을 선택하세요:**
- 프로덕션 CI/CD가 바로 필요할 때
- 빌드 단계 없이 vanilla JavaScript를 선호할 때
- 듀얼 퍼블리싱이 필요할 때 (VS Marketplace + Open VSX)
- AI 도구로 확장 코드를 생성할 때

**Yeoman을 선택하세요:**
- TypeScript + 완전한 타입 체킹이 필요할 때
- 공식 VS Code 테스트 프레임워크 (`@vscode/test-electron`)가 필요할 때
- webpack/esbuild 번들링이 내장된 걸 원할 때

### TypeScript는?

이 템플릿은 빌드 단계 없는 철학을 유지하기 위해 의도적으로 vanilla JavaScript를 사용합니다. TypeScript가 필요하면:

1. `devDependencies`에 `typescript` 추가
2. `tsconfig.json` 추가
3. `package.json`에 `tsc` 빌드 스텝 추가
4. `.js` 파일을 `.ts`로 변경

TypeScript는 강제가 아니라 선택입니다.

## 기여

PR 환영합니다. [PR 템플릿](.github/PULL_REQUEST_TEMPLATE.md)을 사용해 주세요.

## 라이선스

[MIT](LICENSE)
