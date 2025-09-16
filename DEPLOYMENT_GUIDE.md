# AI Arena 배포 가이드

## 1. GitHub 저장소 설정

### 1.1 저장소 생성 및 코드 업로드

```bash
# 로컬에서 Git 초기화 (이미 완료됨)
git init
git add .
git commit -m "Initial commit: AI Arena homepage with CI/CD"

# GitHub 저장소와 연결
git remote add origin https://github.com/YOUR_USERNAME/ai-arena.git
git branch -M main
git push -u origin main

# feature 브랜치 생성 및 푸시
git checkout -b feature/T-001-homepage
git push -u origin feature/T-001-homepage
```

### 1.2 GitHub Secrets 설정

GitHub 저장소 → Settings → Secrets and variables → Actions에서 다음 설정:

#### SLACK_WEBHOOK
1. Slack 워크스페이스에서 Incoming Webhooks 앱 설치
2. #ai-project-feed 채널에 웹훅 생성
3. 생성된 웹훅 URL을 `SLACK_WEBHOOK`으로 저장

#### VERCEL_TOKEN
1. Vercel 계정 로그인 → Settings → Tokens
2. 새 토큰 생성 (Scope: Full Account)
3. 생성된 토큰을 `VERCEL_TOKEN`으로 저장

## 2. Vercel 프로젝트 설정

### 2.1 Vercel 프로젝트 생성

```bash
# Vercel CLI 설치 (필요시)
npm i -g vercel

# 프로젝트 연결
vercel link

# 프로젝트 설정
vercel --prod
```

### 2.2 Vercel 설정 파일 (선택사항)

`vercel.json` 파일 생성:

```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "framework": "vite"
}
```

## 3. CI/CD 워크플로우 테스트

### 3.1 CI 테스트

```bash
# feature 브랜치에서 변경사항 푸시
git add .
git commit -m "[T-001] feat(homepage): update UI components"
git push origin feature/T-001-homepage
```

예상 결과:
- GitHub Actions CI 워크플로우 실행
- 빌드 및 테스트 통과
- Slack #ai-project-feed 채널에 알림

### 3.2 배포 테스트

```bash
# main 브랜치로 머지
git checkout main
git merge feature/T-001-homepage
git push origin main
```

예상 결과:
- GitHub Actions 배포 워크플로우 실행
- Vercel로 자동 배포
- Slack 채널에 배포 완료 알림

## 4. Pull Request 워크플로우

### 4.1 PR 생성

1. GitHub에서 feature/T-001-homepage → main PR 생성
2. PR 제목: `[T-001] feat(homepage): initial UI`
3. CI 워크플로우 자동 실행 확인

### 4.2 PR 머지

1. CI 통과 확인
2. 코드 리뷰 완료
3. PR 머지
4. 자동 배포 실행 확인

## 5. 모니터링 및 알림

### 5.1 Slack 알림 형식

**CI 성공 시:**
```
Manus ▶ T-001 Dev passed CI | run: https://github.com/USER/REPO/actions/runs/RUN_ID
```

**배포 성공 시:**
```
Manus ▶ T-001 Deploy passed | preview: https://your-vercel-app.vercel.app
```

### 5.2 실패 시 대응

1. GitHub Actions 로그 확인
2. 빌드 오류 수정
3. 재푸시 또는 재실행

## 6. 배포 명령어

### 6.1 수동 배포 실행

```bash
/execute deployment --run-id latest --approver @ManusAI
```

### 6.2 롤백 (필요시)

```bash
# Vercel에서 이전 배포로 롤백
vercel rollback
```

## 7. 환경별 설정

### 7.1 개발 환경
- URL: http://localhost:5173
- 브랜치: feature/T-001-homepage

### 7.2 프로덕션 환경
- URL: https://your-vercel-app.vercel.app
- 브랜치: main

## 8. 트러블슈팅

### 8.1 일반적인 문제

**빌드 실패:**
- `package.json`의 스크립트 확인
- 의존성 설치 문제 확인

**배포 실패:**
- Vercel 토큰 유효성 확인
- 프로젝트 설정 확인

**Slack 알림 실패:**
- 웹훅 URL 유효성 확인
- 채널 권한 확인

### 8.2 로그 확인 방법

1. GitHub Actions: Repository → Actions 탭
2. Vercel: Dashboard → Project → Functions 탭
3. Slack: 채널 메시지 히스토리

## 9. 완료 체크리스트

- [ ] GitHub 저장소 생성 및 코드 업로드
- [ ] GitHub Secrets 설정 (SLACK_WEBHOOK, VERCEL_TOKEN)
- [ ] Vercel 프로젝트 연결
- [ ] feature 브랜치에서 CI 테스트
- [ ] main 브랜치로 배포 테스트
- [ ] Slack 알림 확인
- [ ] 프로덕션 URL 접속 확인

배포 완료 후 다음 메시지를 복사하여 보고:

```
/* PR 머지 직후 자동 배포되며, 액션이 Slack으로 결과 전송됨 */
```

