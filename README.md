# AI Arena

AI와 함께하는 토론의 장

## 프로젝트 개요

AI Arena는 사용자가 AI와 함께 다양한 주제로 토론할 수 있는 웹 플랫폼입니다. 현재 홈페이지 UI가 구현되어 있으며, GitHub Actions를 통한 CI/CD 파이프라인이 설정되어 있습니다.

## 기술 스택

- **Frontend**: React 18.3.1, TypeScript 5.6.2, Vite 6.0.1
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS 3.4.15
- **AI Integration**: @ai-sdk (OpenAI, Anthropic, Google)
- **Routing**: React Router DOM 7.0.2
- **Animation**: Framer Motion 12.23.15
- **Forms**: React Hook Form 7.54.0
- **Package Manager**: pnpm 9.12.1
- **CI/CD**: GitHub Actions
- **배포**: Vercel (Node.js 20.x)
- **도메인**: jasoneye.com

## 프로젝트 구조

```
ai-arena/
├── .github/
│   └── workflows/
│       ├── ci.yml          # CI 워크플로우
│       └── deploy.yml      # 배포 워크플로우
├── src/
│   ├── components/
│   │   └── ui/            # shadcn/ui 컴포넌트
│   ├── App.jsx            # 메인 앱 컴포넌트
│   ├── App.css            # 스타일시트
│   └── main.jsx           # 진입점
├── package.json
├── vite.config.js
└── README.md
```

## 개발 환경 설정

### 1. 의존성 설치
```bash
pnpm install
```

### 2. 개발 서버 실행
```bash
pnpm run dev
```

### 3. 빌드
```bash
pnpm run build
```

### 4. 테스트 (CI용)
```bash
pnpm run test:ci
```

## CI/CD 설정

### GitHub Secrets 설정 필요

프로젝트가 정상적으로 작동하려면 다음 GitHub Secrets를 설정해야 합니다:

1. **SLACK_WEBHOOK**: Slack Incoming Webhook URL (#ai-project-feed 채널용)
2. **VERCEL_TOKEN**: Vercel 배포를 위한 토큰

### 브랜치 전략

- **feature/T-001-homepage**: 개발 브랜치
- **main**: 프로덕션 브랜치

### 워크플로우

1. **CI 워크플로우** (`.github/workflows/ci.yml`)
   - Pull Request 및 feature 브랜치 push 시 실행
   - 빌드 및 테스트 수행
   - Slack으로 결과 알림

2. **배포 워크플로우** (`.github/workflows/deploy.yml`)
   - main 브랜치 push 시 실행
   - Vercel로 자동 배포
   - Slack으로 배포 결과 알림

## 배포 명령

```bash
/execute deployment --run-id latest --approver @ManusAI
```

## 🔍 자동화 점검 스크립트

### 1. 뷰포트 점검 스크립트 🔍

화면 깨짐 방지를 위한 뷰포트 meta 태그 점검

```bash
# 기본 점검
pnpm run check:viewport

# 자동 수정
pnpm run check:viewport:fix

# 또는 직접 실행
node scripts/checkViewport.cjs
node scripts/checkViewport.cjs --fix
node scripts/checkViewport.cjs --build
```

**기능:**
- ✅ `index.html` 뷰포트 태그 확인
- ✅ 빌드된 파일들(`dist/`) 자동 스캔
- ✅ 다양한 허용 가능한 뷰포트 형식 지원
- ✅ 자동 수정 기능
- ✅ 컬러풀한 결과 출력

### 2. API 연결 상태 점검 스크립트 🔗

시스템 전반의 연결 상태와 API 작동 여부 점검

```bash
# 전체 점검
pnpm run check:api

# 빠른 점검 (API 제외)
pnpm run check:api:quick

# 또는 직접 실행
node scripts/checkAPI.cjs
node scripts/checkAPI.cjs --skip-api
node scripts/checkAPI.cjs --skip-website
node scripts/checkAPI.cjs --skip-network
node scripts/checkAPI.cjs --save-json
```

**기능:**
- ✅ 네트워크 연결 상태 확인
- ✅ 환경 변수 설정 상태 점검
- ✅ 웹사이트 접근성 테스트
- ✅ AI API 엔드포인트 테스트
- ✅ 응답 시간 측정
- ✅ JSON 결과 저장 옵션

### 3. 통합 점검

```bash
# 모든 점검 실행
pnpm run check:all
```

## 현재 구현된 기능

- ✅ 홈페이지 UI (검색창 + 토론 시작 버튼)
- ✅ 반응형 디자인
- ✅ GitHub Actions CI/CD 설정
- ✅ Slack 알림 통합
- ✅ **Synapse v2 AI 오케스트레이션 시스템**
- ✅ **4개 AI 모델 협업** (GPT-4o, Gemini, Claude, Grok)
- ✅ **자동화 점검 스크립트** (뷰포트, API 연결)

## 향후 개발 계획

- [ ] 토론 페이지 구현
- [ ] AI 통합 (ChatGPT, Claude 등)
- [ ] 사용자 인증
- [ ] 토론 히스토리
- [ ] 실시간 채팅 기능

## 라이선스

MIT License



---
**Test Update**: Testing current deploy workflow - $(date +"%Y-%m-%d %H:%M:%S")


---
**Test Update #2**: Testing after Actions policy update - 2025-09-17 00:07:21

---
**Test Update #3**: Testing current workflow after Actions policy update - 2025-09-17 00:15:18

---
**Test Update #4**: Testing current workflow with updated Actions policy - 2025-09-17 00:18:43
