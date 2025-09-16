# 🎯 AI Arena 프로젝트 최종 설정 가이드

## ✅ 완성된 구성요소

### **1. 컴포지트 액션 알림 시스템**
- **위치**: `.github/actions/notify/action.yml`
- **기능**: EVENT JSON + Slack 한 줄 알림 통합 전송
- **검증**: URL 유효성 검사 및 에러 방지 로직 포함

### **2. Manual Ping 테스트 워크플로우**
- **위치**: `.github/workflows/manual-ping.yml`
- **용도**: 알림 시스템 즉시 테스트
- **실행**: GitHub Actions → Manual Ping → Run workflow

## 🔑 필수 GitHub Secrets 설정

### **설정 경로**
저장소 → Settings → Secrets and variables → Actions → New repository secret

### **필수 Secrets (3개)**
1. **EVENT_WEBHOOK**: Supabase Edge Function URL
   ```
   https://your-project.supabase.co/functions/v1/event-handler
   ```

2. **EVENT_SECRET**: 서명 검증용 공유 시크릿
   ```
   your-secret-key-for-webhook-signing
   ```

3. **SLACK_WEBHOOK**: Slack Incoming Webhook URL
   ```
   https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
   ```

## 🚀 테스트 절차

### **1. Secrets 설정 완료 확인**
- EVENT_WEBHOOK ✓
- EVENT_SECRET ✓  
- SLACK_WEBHOOK ✓

### **2. Manual Ping 실행**
1. GitHub Actions → Manual Ping
2. Run workflow 클릭
3. 실행 완료 대기

### **3. 결과 확인**
- **Slack**: #ai-project-feed 채널에 메시지 1건
  ```
  ChatGPT ▶ T-000 Ops updated | Manual sync ping
  ```
- **DB**: event_logs 테이블에 JSON 데이터 1행
  ```json
  {
    "ticket_id": "T-000",
    "actor": "ChatGPT", 
    "phase": "Ops",
    "status": "updated",
    "ts": "2025-09-17T10:31:00+09:00",
    "links": {"run": "https://github.com/..."},
    "notes": "Manual sync ping"
  }
  ```

## 🔧 문제 해결

### **URL 에러 (curl: URL rejected)**
- Secrets 값에 공백이나 특수문자 포함 여부 확인
- URL 형식 정확성 검증 (https:// 시작)

### **권한 에러 (403 Forbidden)**
- EVENT_SECRET 값이 서버와 일치하는지 확인
- Slack Webhook URL이 올바른 채널에 연결되었는지 확인

### **타임아웃 에러**
- 네트워크 연결 상태 확인
- Webhook 엔드포인트 서버 상태 확인

## 🎉 성공 기준

✅ Manual Ping 워크플로우 성공 실행
✅ Slack 채널에 알림 메시지 수신
✅ DB에 JSON 이벤트 로그 저장
✅ 에러 없이 완료

이 3가지가 모두 확인되면 알림 시스템이 완벽하게 작동하는 것입니다!

