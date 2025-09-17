# AI Arena

AI와 함께하는 토론의 장

## 프로젝트 개요

AI Arena는 사용자가 AI와 함께 다양한 주제로 토론할 수 있는 웹 플랫폼입니다. 현재 홈페이지 UI가 구현되어 있으며, GitHub Actions를 통한 CI/CD 파이프라인이 설정되어 있습니다.

## 기술 스택

- **Frontend**: React 19, Vite, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **CI/CD**: GitHub Actions
- **배포**: Vercel
- **알림**: Slack 통합

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

## 현재 구현된 기능

- ✅ 홈페이지 UI (검색창 + 토론 시작 버튼)
- ✅ 반응형 디자인
- ✅ GitHub Actions CI/CD 설정
- ✅ Slack 알림 통합

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
