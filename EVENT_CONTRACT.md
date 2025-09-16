# Event Contract v1

## 이벤트 계약 규격

```typescript
interface EventContract {
  ticket_id: string;        // 예) T-002
  actor: "ChatGPT" | "Gemini" | "Claude" | "Grok" | "Manus";
  phase: "Plan" | "Dev" | "Review" | "Stress" | "Deploy" | "Ops";
  status: "started" | "updated" | "passed" | "failed" | "blocked" | "done";
  ts: string;               // ISO8601 예) 2025-09-17T10:31:00+09:00
  links: {
    pr?: string;
    run?: string;
    preview?: string;
  };
  notes?: string;
}
```

## Slack 한 줄 규격

```
<Actor> ▶ <Ticket> <Phase> <Status> | <요약 또는 링크>
```

### 예시
```
Gemini ▶ T-002 Dev started | branch: feature/T-002-search-api
Manus ▶ T-001 Deploy passed | preview: https://ai-arena.vercel.app
Claude ▶ T-003 Review failed | PR needs security fixes
```

## 설정 정보

- **채널**: #ai-project-feed
- **Secret**: SLACK_WEBHOOK
- **GitHub Secrets 경로**: Settings → Secrets and variables → Actions → New repository secret

## 표준 워크플로우

### CI 워크플로우
- **파일**: `.github/workflows/ci.yml`
- **트리거**: PR to main, push to feature/*
- **알림**: 성공/실패 모두 전송

### Deploy 워크플로우
- **파일**: `.github/workflows/deploy.yml`
- **트리거**: push to main
- **알림**: 배포 결과 전송

## 필수 Secrets
- `SLACK_WEBHOOK`: Slack 알림용 웹훅 URL
- `VERCEL_TOKEN`: Vercel 배포용 토큰

## 패키지 관리
- **패키지 매니저**: pnpm@9
- **락파일**: pnpm-lock.yaml (반드시 커밋)
- **package.json**: `"packageManager": "pnpm@9"` 필드 포함

