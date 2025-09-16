# 🔐 GitHub Secrets 검증 및 문제 해결 가이드

## 🎯 **시크릿 정리 및 검증 시스템**

### **자동 처리 기능**
- ✅ **개행/캐리지리턴 제거**: 복사 시 포함된 줄바꿈 문자 자동 제거
- ✅ **공백 제거**: 앞뒤 공백 자동 트림
- ✅ **따옴표 제거**: 실수로 포함된 따옴표 자동 제거
- ✅ **URL 형식 검증**: https:// 시작 및 공백 없음 확인
- ✅ **해시 출력**: 민감한 값 노출 없이 변경 여부 확인

## 🔑 **필수 GitHub Secrets (3개)**

### **1. EVENT_WEBHOOK**
```
https://your-project.supabase.co/functions/v1/event-handler
```
- **형식**: https://로 시작하는 완전한 URL
- **주의**: 끝에 공백이나 개행 없어야 함

### **2. EVENT_SECRET**
```
your-secret-key-for-webhook-signing
```
- **형식**: 임의의 문자열 (서버와 동일해야 함)
- **주의**: 따옴표로 감싸지 말 것

### **3. SLACK_WEBHOOK**
```
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```
- **형식**: Slack Incoming Webhook URL
- **주의**: 전체 URL을 정확히 복사

## 🚨 **일반적인 문제 및 해결**

### **문제 1: "URL rejected: Malformed input"**
**원인**: URL에 공백, 개행, 또는 잘못된 문자 포함
**해결**: 자동 정리 시스템이 처리하지만, 복사 시 주의

### **문제 2: "EVENT_WEBHOOK empty"**
**원인**: Secret이 설정되지 않았거나 이름이 틀림
**해결**: Settings → Secrets → 정확한 이름으로 재설정

### **문제 3: "invalid URL"**
**원인**: https:// 시작하지 않거나 URL 형식 오류
**해결**: 완전한 URL 형식으로 재설정

## 🔍 **검증 로그 해석**

### **성공 시 출력**
```
✅ secrets look valid & sanitized
EVENT_WEBHOOK_SHA256 a1b2c3d4e5f6...
SLACK_WEBHOOK_SHA256 f6e5d4c3b2a1...
```

### **실패 시 출력**
```
❌ EVENT_WEBHOOK empty
❌ SLACK_WEBHOOK invalid URL
```

## 📋 **설정 체크리스트**

### **GitHub Secrets 설정**
- [ ] EVENT_WEBHOOK: Supabase Edge Function URL
- [ ] EVENT_SECRET: 서명 검증용 시크릿
- [ ] SLACK_WEBHOOK: Slack Incoming Webhook URL

### **값 검증**
- [ ] 모든 URL이 https://로 시작
- [ ] 앞뒤 공백 없음
- [ ] 따옴표로 감싸지 않음
- [ ] 개행 문자 없음

### **테스트 실행**
- [ ] Manual Ping 워크플로우 실행
- [ ] 검증 단계 통과 확인
- [ ] Slack 메시지 수신 확인
- [ ] DB 이벤트 로그 저장 확인

## 🛠️ **문제 해결 순서**

1. **GitHub Secrets 재확인**: 이름과 값 정확성
2. **Manual Ping 실행**: 자동 검증 로그 확인
3. **에러 메시지 분석**: 구체적인 실패 원인 파악
4. **값 재설정**: 문제가 있는 Secret 다시 입력
5. **재테스트**: 수정 후 다시 실행

이 가이드를 따르면 모든 시크릿 관련 문제를 해결할 수 있습니다! 🎉

