# 🔧 핫픽스 노트: JSON Output 문제 해결

## 🚨 문제 원인
```yaml
echo "EVENT=$EVENT" >> $GITHUB_OUTPUT  # ❌ JSON 한 덩어리를 output에 넣음
```
- **에러**: `Invalid format` 발생
- **원인**: GITHUB_OUTPUT은 복잡한 JSON 구조를 처리할 수 없음

## ✅ 해결 방법

### **1. JSON 처리**
```bash
# ❌ 기존: output으로 JSON 전달
echo "EVENT=$EVENT" >> $GITHUB_OUTPUT

# ✅ 신규: 파일로 JSON 저장
jq -n ... > event.json
curl --data-binary @event.json
```

### **2. Slack 메시지 처리**
```bash
# ✅ 한 줄 문자열은 GITHUB_ENV 사용
MSG="Manus ▶ T-001 Dev passed | CI passed"
ESCAPED=$(printf '%s' "$MSG" | jq -Rsa .)
echo "SLACK_ESCAPED=$ESCAPED" >> $GITHUB_ENV
```

## 🔧 적용된 변경사항

### **Build 단계**
- **JSON**: `event.json` 파일로 직접 저장
- **Slack**: `GITHUB_ENV`로 이스케이프된 문자열 전달
- **제거**: `GITHUB_OUTPUT`에 JSON 저장하는 모든 코드

### **전송 단계**
- **EVENT**: `--data-binary @event.json` 파일 전송
- **Slack**: `${SLACK_ESCAPED}` 환경변수 사용

## 🎯 핵심 포인트

### **GITHUB_OUTPUT 사용 규칙**
- ✅ **적합**: 단순 문자열, 숫자, 불린값
- ❌ **부적합**: 복잡한 JSON, 멀티라인 텍스트

### **GITHUB_ENV 사용 규칙**
- ✅ **적합**: 다음 스텝에서 사용할 환경변수
- ✅ **장점**: 이스케이프된 문자열도 안전하게 전달

### **파일 기반 처리**
- ✅ **JSON**: 파일로 저장 후 바이너리 전송
- ✅ **안정성**: 파싱 에러 완전 방지
- ✅ **디버깅**: 파일 내용 직접 확인 가능

## 🚀 테스트 방법

### **Manual Ping 실행**
1. GitHub Actions → Manual Ping
2. Run workflow 클릭
3. 로그에서 `event.json` 파일 생성 확인
4. Slack 메시지 정상 전송 확인

### **기대 결과**
- ✅ **에러 없음**: Invalid format 에러 해결
- ✅ **Slack 알림**: 정상적인 한 줄 메시지
- ✅ **JSON 전송**: 구조화된 이벤트 데이터 정상 전송

## 📋 체크리스트

- ✅ `echo "EVENT=..." >> $GITHUB_OUTPUT` 모든 줄 제거
- ✅ `event.json` 파일 생성 로직 추가
- ✅ `GITHUB_ENV` 사용으로 Slack 메시지 전달
- ✅ `--data-binary @event.json` 파일 전송 방식 적용

이제 JSON 처리 문제가 완전히 해결되었습니다! 🎉


## 🔄 재사용 워크플로우 올바른 사용법

### **문제점**
- **잘못된 방식**: `steps` 레벨에서 `uses: ./.github/workflows/_notify.yml` 호출
- **에러**: "Unexpected value 'secrets'" 또는 호출 실패

### **올바른 방식**
```yaml
jobs:
  notify:
    # ✅ jobs 레벨에서 uses 사용
    uses: yhun1542/ai-arena/.github/workflows/_notify.yml@main
    with:
      ticket: "T-001"
      actor: "Manus"
      phase: "Dev"
      status: "passed"
      notes: "CI passed"
    # ✅ secrets는 job 레벨에서만 사용 가능
    secrets: inherit
```

### **핵심 규칙**
1. **Job 레벨 호출**: `jobs.<id>.uses`에서 재사용 워크플로우 호출
2. **절대 경로**: `<OWNER>/<REPO>/.github/workflows/_notify.yml@<BRANCH>` 형식
3. **브랜치 지정**: `@main` 또는 해당 브랜치명
4. **시크릿 상속**: `secrets: inherit`로 모든 시크릿 전달

### **수정된 워크플로우**
- ✅ **manual-ping.yml**: Job 레벨 호출로 수정
- ✅ **ci.yml**: 별도 notify job으로 분리
- ✅ **deploy.yml**: 별도 notify job으로 분리
- ✅ **status-pulse.yml**: Job 간 outputs 전달로 수정

### **장점**
- **안정성**: GitHub Actions의 표준 방식 준수
- **호환성**: 모든 GitHub 기능과 완벽 호환
- **확장성**: 다른 저장소에서도 재사용 가능

이제 재사용 워크플로우가 올바른 방식으로 작동합니다! 🎯

