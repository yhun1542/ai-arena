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



## 폴백 수집 (누락 방지용)

### Status Pulse 워크플로우
- **파일**: `.github/workflows/status-pulse.yml`
- **스케줄**: 매 정시 (UTC 기준) - `0 * * * *`
- **수동 실행**: workflow_dispatch 지원
- **목적**: 웹훅 누락 시에도 최소 시간당 1회 상태 파악 메시지 보장

### Pulse 메시지 형식
```
Manus ▶ T-001 Pulse | open PRs: {수}, latest run: {링크}
```

### 예시
```
Manus ▶ T-001 Pulse | open PRs: 2, latest run: https://github.com/yhun1542/ai-arena/actions
Manus ▶ T-001 Pulse | open PRs: 0, latest run: https://github.com/yhun1542/ai-arena/actions
```

### 수집 정보
- **Open PRs**: 현재 열린 Pull Request 수
- **Latest Run**: 최근 Actions 실행 링크
- **실행 주기**: 매시간 정각 (UTC)

이 시스템은 다른 알림이 실패하더라도 프로젝트 상태를 지속적으로 모니터링할 수 있도록 보장합니다.

