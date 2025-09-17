# T-011: jasoneye.com DNS/Vercel 연결 및 도메인 전환 계획

## 🎯 작업 개요

**티켓**: T-011  
**목표**: jasoneye.com 도메인을 AI Arena 프로젝트에 연결하고 301 리다이렉트 정책 통일  
**우선순위**: High  
**담당**: Claude (DevOps)  

## 📋 작업 범위

### 1. DNS 설정
- `jasoneye.com` A 레코드를 Vercel IP로 설정
- `www.jasoneye.com` CNAME을 `jasoneye.com`으로 설정
- DNS 전파 확인 및 검증

### 2. Vercel 도메인 연결
- Vercel 프로젝트에 `jasoneye.com` 커스텀 도메인 추가
- SSL 인증서 자동 발급 확인
- 도메인 검증 완료

### 3. 301 리다이렉트 정책 통일
- `www.jasoneye.com` → `jasoneye.com` (non-www 정책)
- 기존 `ai-arena-xi.vercel.app` → `jasoneye.com` 리다이렉트
- HTTP → HTTPS 강제 리다이렉트

### 4. 프리뷰 보호 설정
- 프로덕션: `jasoneye.com` (공개)
- 프리뷰 배포: 보호 유지 (인증 필요)
- 개발 환경: 내부 접근만 허용

## 🔧 기술적 구현

### DNS 구성 (예상)
```dns
# A 레코드
jasoneye.com.     A     76.76.19.61

# CNAME 레코드  
www.jasoneye.com. CNAME jasoneye.com.
```

### Vercel 설정 업데이트
```json
{
  "domains": [
    "jasoneye.com",
    "www.jasoneye.com"
  ],
  "redirects": [
    {
      "source": "https://www.jasoneye.com/:path*",
      "destination": "https://jasoneye.com/:path*",
      "permanent": true
    }
  ]
}
```

### 보안 헤더 적용 확인
- 커스텀 도메인에서 보안 헤더 정상 작동 검증
- HSTS preload 도메인 등록 고려
- CSP 정책에 새 도메인 반영

## 📊 검증 계획

### 1. DNS 전파 확인
```bash
# DNS 조회 테스트
dig jasoneye.com A
dig www.jasoneye.com CNAME

# 전 세계 DNS 전파 확인
nslookup jasoneye.com 8.8.8.8
nslookup jasoneye.com 1.1.1.1
```

### 2. SSL 인증서 확인
```bash
# SSL 인증서 정보 확인
openssl s_client -connect jasoneye.com:443 -servername jasoneye.com
```

### 3. 리다이렉트 테스트
```bash
# 301 리다이렉트 확인
curl -I https://www.jasoneye.com
curl -I http://jasoneye.com
```

### 4. 보안 헤더 검증
```javascript
// 브라우저에서 헤더 확인
fetch('https://jasoneye.com', { method: 'HEAD' })
  .then(response => {
    console.log('Security Headers:', response.headers);
  });
```

## 🚀 배포 전략

### Phase 1: DNS 설정 (30분)
1. DNS 제공업체에서 A/CNAME 레코드 설정
2. DNS 전파 대기 (최대 24시간, 보통 1-2시간)
3. 기본 연결 확인

### Phase 2: Vercel 연결 (15분)
1. Vercel 대시보드에서 커스텀 도메인 추가
2. 도메인 소유권 검증
3. SSL 인증서 자동 발급 대기

### Phase 3: 리다이렉트 설정 (10분)
1. `vercel.json`에 리다이렉트 규칙 추가
2. 301 정책 테스트 및 검증
3. 기존 URL 접근성 확인

### Phase 4: 보안 검증 (15분)
1. 새 도메인에서 보안 헤더 확인
2. Lighthouse 점수 재측정
3. 최종 기능 테스트

## ⚠️ 위험 요소 및 대응

### DNS 전파 지연
- **위험**: DNS 변경사항이 전파되는데 시간 소요
- **대응**: TTL을 낮게 설정하여 전파 시간 단축
- **롤백**: 기존 DNS 설정으로 즉시 복원 가능

### SSL 인증서 발급 실패
- **위험**: Let's Encrypt 인증서 발급 지연/실패
- **대응**: Vercel 자동 재시도 대기, 수동 갱신 옵션
- **롤백**: 기존 vercel.app 도메인으로 임시 운영

### 기존 사용자 접근 중단
- **위험**: 도메인 전환 중 일시적 접근 불가
- **대응**: 점진적 전환, 기존 URL 유지
- **롤백**: release-2025-09-17-v1 태그로 즉시 복원

## 📈 성공 지표

### 기술적 지표
- DNS 해상도: 100% (모든 주요 DNS 서버)
- SSL 등급: A+ (SSL Labs 테스트)
- 응답 시간: <200ms (첫 바이트까지)
- 가용성: 99.9% (24시간 모니터링)

### 보안 지표
- 보안 헤더: 7개 모두 적용
- Lighthouse Best Practices: 95+
- HSTS preload: 등록 완료
- CSP 정책: 엄격 모드 유지

### 사용자 경험 지표
- 301 리다이렉트: <100ms
- 페이지 로드: <2초
- 모바일 성능: 90+ (Lighthouse)
- 접근성: 100% (WCAG 2.1 AA)

## 🔄 롤백 계획

### 즉시 롤백 (5분 이내)
1. DNS 설정을 이전 상태로 복원
2. Vercel에서 커스텀 도메인 제거
3. 기존 vercel.app URL로 트래픽 복원

### 코드 롤백 (10분 이내)
1. `git checkout release-2025-09-17-v1`
2. GitHub Actions 워크플로우 재실행
3. 안정적인 버전으로 배포 복원

### 데이터 무결성 확인
- 사용자 세션 유지 확인
- API 엔드포인트 정상 작동 확인
- 데이터베이스 연결 상태 점검

## 📅 타임라인

**D-day 준비**: 
- DNS 변경 24시간 전 TTL 단축
- 모든 팀원에게 전환 일정 공지
- 모니터링 시스템 준비

**D-day 실행**:
- 09:00: DNS 설정 변경
- 10:00: Vercel 도메인 연결
- 11:00: 리다이렉트 설정 및 테스트
- 12:00: 보안 검증 및 최종 확인

**D+1 모니터링**:
- 24시간 연속 모니터링
- 성능 지표 수집 및 분석
- 사용자 피드백 수집

---

## 🎯 다음 단계

1. **DNS 제공업체 확인**: jasoneye.com 도메인 관리 권한 확인
2. **Vercel 프로젝트 설정**: 현재 배포된 프로젝트 식별
3. **보안 헤더 재검증**: 실제 배포 URL에서 헤더 적용 상태 확인
4. **전환 D-day 스케줄링**: 최적 시간대 선정 및 팀 조율

**상태**: 📋 **계획 수립 완료** - 실행 준비 중
