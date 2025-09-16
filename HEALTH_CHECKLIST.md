# 🔎 건강검진 체크리스트 (1분)

## 필수 GitHub Secrets 설정

### 기존 Secrets ✅
- ✅ **SLACK_WEBHOOK**: Slack 알림용 웹훅 URL (이미 설정됨)
- ✅ **VERCEL_TOKEN**: Vercel 배포용 토큰 (이미 설정됨)

### 추가 필요 Secrets 🆕
- 🆕 **EVENT_WEBHOOK**: Supabase Edge Function URL 등
- 🆕 **EVENT_SECRET**: 서명용 공유 시크릿 (Edge Function에서 검증)

### 설정 경로
```
GitHub 저장소 → Settings → Secrets and variables → Actions → New repository secret
```

## 시스템 요구사항

### 패키지 관리 ✅
- ✅ **pnpm-lock.yaml**: 커밋됨 (182,534 bytes)
- ✅ **packageManager**: `"packageManager": "pnpm@9"` 설정 완료

### GitHub Actions 권한 ✅
- ✅ **GITHUB_TOKEN**: 자동 지급 (기본값 OK)
- ✅ **Actions 권한**: 워크플로우 실행 가능

### Supabase 설정 (필요시)
- 🔧 **Edge Function**: x-event-secret 검증 활성화
- 🔧 **event_logs 테이블**: 이벤트 저장용

## 🚀 즉시 테스트 방법

### Manual Ping 워크플로우
1. **GitHub 저장소** → **Actions** 탭
2. **Manual Ping** 워크플로우 선택
3. **Run workflow** 버튼 클릭
4. 실행 완료 대기

### 기대 결과
- ✅ **Slack #ai-project-feed**: 원라이너 1건
  ```
  ChatGPT ▶ T-000 Ops updated | Manual sync ping
  ```
- ✅ **Supabase event_logs**: 테이블에 행 1건 (payload 저장)

## 하드닝 적용 사항

### 보안 강화
- **서명 검증**: x-event-secret 헤더로 요청 인증
- **타임아웃**: 10초 최대 대기시간
- **재시도**: 실패 시 2회 재시도 (2초 간격)
- **이스케이프**: Slack 메시지 특수문자 처리

### 안정성 향상
- **jq 설치**: JSON 처리 도구 보장
- **에러 핸들링**: curl 옵션으로 안정성 확보
- **문자열 처리**: 따옴표/개행 안전 처리

## 호환성 확인

### 기존 워크플로우 ✅
- ✅ **ci.yml**: 호환됨 (Dev 단계 알림)
- ✅ **deploy.yml**: 호환됨 (Deploy 단계 알림)
- ✅ **status-pulse.yml**: 호환됨 (Ops 단계 알림)

### 새로운 워크플로우 ✅
- ✅ **manual-ping.yml**: 테스트용 워크플로우 추가

모든 시스템이 준비되었습니다! 🎉


## 🔧 최신 개선 사항

### JSON 파일 처리 최적화 ✅
- **방식**: JSON을 `event.json` 파일로 저장 후 `--data-binary @event.json`로 전송
- **장점**: 출력 파싱 문제 완전 해결, 더 안전한 JSON 처리
- **개선**: 환경변수 이스케이프 불필요, 바이너리 전송으로 안정성 향상

### 처리 흐름
1. **jq**로 JSON 생성 → `event.json` 파일 저장
2. **curl**에서 `--data-binary @event.json`로 파일 직접 전송
3. **Slack 메시지**는 단순 문자열로 별도 처리

### 기술적 장점
- ✅ **파싱 에러 방지**: 복잡한 JSON 구조도 안전하게 처리
- ✅ **메모리 효율**: 대용량 JSON도 파일 스트림으로 처리
- ✅ **디버깅 용이**: event.json 파일로 전송 데이터 확인 가능
- ✅ **특수문자 안전**: 바이너리 전송으로 인코딩 문제 없음

