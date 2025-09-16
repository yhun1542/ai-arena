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


## 재사용 가능한 알림 워크플로우

### _notify.yml 워크플로우
- **파일**: `.github/workflows/_notify.yml`
- **타입**: Reusable workflow (workflow_call)
- **기능**: 이벤트 JSON과 Slack 한 줄 메시지 동시 전송

### 입력 파라미터
```yaml
inputs:
  ticket:   { required: true, type: string }    # 예) T-001
  actor:    { required: true, type: string }    # 예) Manus
  phase:    { required: true, type: string }    # 예) Dev, Deploy, Ops
  status:   { required: true, type: string }    # 예) passed, failed
  notes:    { required: false, type: string }   # 예) CI passed
  pr:       { required: false, type: string }   # PR URL (선택)
  preview:  { required: false, type: string }   # Preview URL (선택)
```

### 사용 방법
```yaml
jobs:
  notify:
    needs: [previous-job]
    if: always()
    uses: ./.github/workflows/_notify.yml
    secrets: inherit
    with:
      ticket: "T-001"
      actor: "Manus"
      phase: "Dev"
      status: "${{ needs.previous-job.result }}"
      notes: "CI ${{ needs.previous-job.result }}"
```

### 전송 채널
1. **EVENT_WEBHOOK**: 구조화된 JSON 이벤트 데이터
2. **SLACK_WEBHOOK**: 한 줄 요약 메시지

### 필수 Secrets
- `EVENT_WEBHOOK`: 이벤트 JSON 전송용 웹훅 URL
- `SLACK_WEBHOOK`: Slack 알림용 웹훅 URL

### 적용된 워크플로우
- ✅ **CI**: Dev 단계 알림
- ✅ **Deploy**: Deploy 단계 알림
- ✅ **Status Pulse**: Ops 단계 알림

이 시스템으로 모든 워크플로우에서 일관된 알림 형식과 이중 채널 전송이 보장됩니다.


## 컴포지트 액션 (Composite Action)

### 구조 변경
- **기존**: 재사용 가능한 워크플로우 (`.github/workflows/_notify.yml`)
- **신규**: 컴포지트 액션 (`.github/actions/notify/action.yml`)

### 컴포지트 액션의 장점
- ✅ **단순한 사용법**: `uses: ./.github/actions/notify` 한 줄로 사용
- ✅ **시크릿 처리**: `env:`로 직접 주입, `secrets: inherit` 불필요
- ✅ **에러 방지**: "Unexpected value 'secrets'" 같은 오류 해결
- ✅ **성능 향상**: 별도 job 생성 없이 같은 job 내에서 실행

### 사용 방법
```yaml
- name: Notify
  uses: ./.github/actions/notify
  with:
    ticket: "T-001"
    actor: "Manus"
    phase: "Dev"
    status: "${{ job.status }}"
    notes: "CI passed"
  env:
    EVENT_WEBHOOK: ${{ secrets.EVENT_WEBHOOK }}
    EVENT_SECRET:  ${{ secrets.EVENT_SECRET }}
    SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
```

### 시크릿 주입 방식
- **컴포지트 액션**: `env:`로 시크릿 주입 (권장)
- **재사용 워크플로우**: `secrets: inherit` 사용 (구형)

### 파일 구조
```
.github/
├── actions/
│   └── notify/
│       └── action.yml          # 컴포지트 액션
└── workflows/
    ├── ci.yml                  # 컴포지트 액션 사용
    ├── deploy.yml              # 컴포지트 액션 사용
    ├── status-pulse.yml        # 컴포지트 액션 사용
    ├── manual-ping.yml         # 테스트용
    └── _notify.yml             # 구형 (제거 예정)
```

### 마이그레이션 완료
- ✅ **CI 워크플로우**: 컴포지트 액션으로 전환
- ✅ **Deploy 워크플로우**: 컴포지트 액션으로 전환  
- ✅ **Status Pulse**: 컴포지트 액션으로 전환
- ✅ **Manual Ping**: 컴포지트 액션으로 전환

이제 모든 워크플로우에서 더 간단하고 안정적인 알림 시스템을 사용할 수 있습니다.

