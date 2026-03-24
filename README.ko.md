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
> [Docker Deploy](https://github.com/starter-series/docker-deploy-starter) · [Discord Bot](https://github.com/starter-series/discord-bot-starter) · [Telegram Bot](https://github.com/starter-series/telegram-bot-starter) · [Browser Extension](https://github.com/starter-series/browser-extension-starter) · [Electron App](https://github.com/starter-series/electron-app-starter) · [npm Package](https://github.com/starter-series/npm-package-starter) · [React Native](https://github.com/starter-series/react-native-starter) · [VS Code Extension](https://github.com/starter-series/vscode-extension-starter) · [MCP Server](https://github.com/starter-series/mcp-server-starter) · [Cloudflare Pages](https://github.com/starter-series/cloudflare-pages-starter)

---

## 빠른 시작

```bash
# 1. GitHub에서 "Use this template" 클릭 (또는 clone)
git clone https://github.com/starter-series/vscode-extension-starter.git my-extension
cd my-extension

# 2. 의존성 설치
npm install

# 3. VS Code에서 열고 F5를 눌러 Extension Development Host 실행

# 4. 명령 팔레트 (Ctrl+Shift+P) → "Hello World"
```

## 포함된 구성

```
├── src/
│   ├── extension.js              # 메인 진입점 (activate/deactivate)
│   └── commands/
│       └── helloWorld.js         # 예제 커맨드
├── tests/
│   ├── __mocks__/
│   │   └── vscode.js            # Jest용 VS Code API 모의 객체
│   └── extension.test.js        # 구조 테스트 (Jest)
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                # 린트, 테스트, 패키지 검증
│   │   ├── cd.yml                # VS Marketplace + Open VSX 배포
│   │   └── setup.yml             # 첫 사용 시 자동 설정 체크리스트
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   ├── MARKETPLACE_SETUP.md      # VS Marketplace PAT 설정 가이드
│   └── OPENVSX_SETUP.md          # Open VSX 토큰 설정 가이드
├── scripts/
│   └── bump-version.js           # Semver 버전 범퍼
└── package.json                  # 확장 매니페스트 + 스크립트
```

## 주요 기능

- **Vanilla JS** — 빌드 단계 없음, TypeScript 컴파일 없음, JavaScript만
- **CI 파이프라인** — 보안 감사, 린트, 테스트, 패키지 빌드 검증
- **CD 파이프라인** — 원클릭 VS Marketplace + Open VSX 배포 + GitHub Release
- **버전 관리** — `npm run version:patch/minor/major`로 `package.json` 버전 업
- **보안** — 매 push마다 `npm audit` 실행
- **스타터 코드** — 단일 커맨드 등록, 쉽게 확장 가능
- **듀얼 퍼블리싱** — VS Marketplace (VS Code) + Open VSX (VS Codium, Gitpod 등)
- **템플릿 셋업** — 첫 사용 시 설정 체크리스트 이슈 자동 생성

## CI/CD

### CI (모든 PR + main push 시)

| 단계 | 역할 |
|------|------|
| 보안 감사 | `npm audit`로 의존성 취약점 확인 |
| 린트 | ESLint v9 flat config |
| 테스트 | Jest (기본적으로 테스트 없이도 통과) |
| 패키지 검증 | `.vsix` 빌드 성공 여부 확인 |

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

1. GitHub Secrets 설정 (아래 참조)
2. 버전 업: `npm run version:patch` (또는 `version:minor` / `version:major`)
3. 커밋하고 `main`에 push
4. **Actions** 탭 → **Publish Extension** → **Run workflow**

### GitHub Secrets

| Secret | Workflow | 설명 |
|--------|----------|------|
| `VSCE_PAT` | `cd.yml` | VS Code Marketplace Personal Access Token |
| `OVSX_PAT` | `cd.yml` | Open VSX Registry 액세스 토큰 |

자세한 설정 방법은 **[docs/MARKETPLACE_SETUP.md](docs/MARKETPLACE_SETUP.md)**를 참고하세요 (VS Marketplace).
Open VSX는 **[docs/OPENVSX_SETUP.md](docs/OPENVSX_SETUP.md)**를 참고하세요.

## 개발

```bash
# Extension Development Host 실행 (VS Code에서 F5)

# 버전 업 (package.json 자동 업데이트)
npm run version:patch   # 0.1.0 → 0.1.1
npm run version:minor   # 0.1.0 → 0.2.0
npm run version:major   # 0.1.0 → 1.0.0

# .vsix 패키지 빌드
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
