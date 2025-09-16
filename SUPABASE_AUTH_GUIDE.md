# 🔐 Supabase Edge Function 인증 가이드

## 🎯 **이중 인증 시스템**

### **1. Supabase 게이트웨이 인증**
- **헤더**: `Authorization: Bearer <SUPABASE_ANON_KEY>`
- **목적**: Supabase Edge Functions 게이트웨이 통과
- **키 타입**: Anon (public) key 사용

### **2. 커스텀 함수 인증**
- **헤더**: `x-event-secret: <EVENT_SECRET>`
- **목적**: 우리 함수 내부에서 추가 검증
- **키 타입**: 사용자 정의 시크릿

## 🔑 **필수 GitHub Secrets (4개)**

### **설정 경로**
저장소 → Settings → Secrets and variables → Actions → New repository secret

### **1. EVENT_WEBHOOK**
```
https://xfwbtloubnwplratrluj.supabase.co/functions/v1/arena-event
```

### **2. EVENT_SECRET**
```
your-custom-secret-key-for-function-validation
```

### **3. SUPABASE_ANON_KEY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```
- **위치**: Supabase Dashboard → Settings → API → anon public key

### **4. SLACK_WEBHOOK**
```
https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

## 🧪 **로컬 테스트 방법**

### **완전한 테스트 명령**
```bash
curl -sS -X POST "https://xfwbtloubnwplratrluj.supabase.co/functions/v1/arena-event" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_SUPABASE_ANON_KEY>" \
  -H "x-event-secret: <YOUR_EVENT_SECRET>" \
  --data '{"ticket_id":"T-TEST","actor":"ChatGPT","phase":"Ops","status":"updated","ts":"2025-09-17T10:31:00+09:00","links":{},"notes":"ping"}' -i
```

### **예상 결과**
- **201**: ✅ 성공 (JSON 응답 포함)
- **401**: ❌ ANON_KEY 또는 EVENT_SECRET 불일치
- **403**: ❌ 권한 부족
- **500**: ❌ 서버 내부 오류

## 🔧 **문제 해결**

### **401 Unauthorized**
1. **SUPABASE_ANON_KEY 확인**: Supabase Dashboard에서 올바른 키 복사
2. **EVENT_SECRET 확인**: Edge Function 환경변수와 일치하는지 확인
3. **헤더 형식 확인**: `Authorization: Bearer` 형식 정확히 사용

### **403 Forbidden**
1. **Edge Function 권한**: 함수가 public 호출을 허용하는지 확인
2. **RLS 정책**: 데이터베이스 테이블의 Row Level Security 설정 확인

### **500 Internal Server Error**
1. **Edge Function 로그**: Supabase Dashboard → Edge Functions → Logs 확인
2. **데이터베이스 연결**: 함수 내부에서 DB 접근 권한 확인

## 🚀 **GitHub Actions 실행**

### **테스트 절차**
1. **4개 Secrets 모두 설정**
2. **로컬 curl 테스트로 201 확인**
3. **GitHub Actions → Manual Ping 실행**
4. **결과 확인**:
   - Slack: `ChatGPT ▶ T-000 Ops updated | Manual sync ping`
   - DB: event_logs 테이블에 JSON 데이터 1행

## 🛡️ **보안 레이어**

### **게이트웨이 레벨**
- Supabase가 JWT 토큰으로 기본 인증
- 공개 anon key로 Edge Function 접근 허용

### **애플리케이션 레벨**
- 우리 함수에서 `x-event-secret` 추가 검증
- 이중 보안으로 무단 접근 방지

이 가이드를 따르면 완벽한 Supabase 인증이 구현됩니다! 🎉

