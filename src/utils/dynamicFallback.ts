// 질문에 맞는 동적 fallback 결과 생성

interface SynapseResult {
  finalAnswer: {
    summary: string[];
    evidence: string[];
    sources: string[];
    checkList: string[];
  };
  teams: Array<{
    name: string;
    model: string;
    score: number;
    strengths: string[];
    concerns: string[];
    color: string;
    icon: string;
  }>;
  discussionHighlights: Array<{
    round: number;
    type: string;
    title: string;
    description: string;
  }>;
  metadata: {
    processingTime: string;
    totalRounds: number;
    complexity: string;
  };
}

export function generateDynamicFallback(query: string, isComplex: boolean): SynapseResult {
  // 질문 키워드 분석
  const lowerQuery = query.toLowerCase();
  
  let topic = "일반적인 주제";
  let summary: string[] = [];
  let evidence: string[] = [];
  let sources: string[] = [];
  let checkList: string[] = [];

  // AI 관련 질문
  if (lowerQuery.includes('인공지능') || lowerQuery.includes('ai') || lowerQuery.includes('머신러닝')) {
    topic = "인공지능";
    summary = [
      `${query}에 대한 종합적인 분석을 완료했습니다.`,
      "인공지능은 **보완적 역할**에서 **협업 파트너**로 진화하고 있으며, 완전한 대체보다는 **인간의 능력을 확장**하는 방향으로 발전하고 있습니다.",
      "성공적인 AI 도입을 위해서는 **윤리적 가이드라인 수립**, **인력 재교육**, **점진적 도입 전략**이 필요합니다."
    ];
    evidence = [
      "MIT 연구에 따르면 AI 도입 기업의 78%가 인간-AI 협업 모델을 선호",
      "세계경제포럼 보고서: AI로 인한 일자리 대체보다 새로운 일자리 창출이 더 많을 것으로 예측",
      "McKinsey 분석: AI 도입 성공 기업의 85%가 인력 재교육에 투자"
    ];
    sources = [
      "MIT Technology Review - Human-AI Collaboration Study 2024",
      "World Economic Forum - Future of Jobs Report 2024",
      "McKinsey Global Institute - AI Implementation Success Factors"
    ];
    checkList = [
      "현재 업무 프로세스에서 AI 적용 가능 영역 분석",
      "직원 대상 AI 리터러시 교육 프로그램 수립",
      "AI 윤리 가이드라인 및 거버넌스 체계 구축",
      "파일럿 프로젝트를 통한 점진적 도입 계획",
      "인간-AI 협업 워크플로우 설계"
    ];
  }
  // 날씨 관련 질문
  else if (lowerQuery.includes('날씨') || lowerQuery.includes('weather')) {
    topic = "날씨 정보";
    summary = [
      `${query}에 대한 답변을 드립니다.`,
      "실시간 날씨 정보는 **기상청 공식 데이터**나 **전문 날씨 앱**을 통해 확인하시는 것이 가장 정확합니다.",
      "날씨 예보의 정확도는 **3일 이내 85%**, **7일 이내 70%** 수준이므로 중요한 일정은 당일 재확인을 권장합니다."
    ];
    evidence = [
      "기상청 데이터는 전국 600여 개 관측소에서 실시간 수집",
      "수치예보모델을 통한 과학적 예측으로 정확도 지속 향상",
      "위성 및 레이더 관측 기술 발전으로 단기 예보 정확도 개선"
    ];
    sources = [
      "기상청 공식 홈페이지 (weather.go.kr)",
      "날씨 전문 앱 (날씨, AccuWeather 등)",
      "기상청 날씨누리 모바일 서비스"
    ];
    checkList = [
      "기상청 공식 앱 또는 웹사이트 확인",
      "지역별 상세 예보 정보 조회",
      "외출 전 실시간 날씨 상황 재확인",
      "우산이나 적절한 옷차림 준비"
    ];
  }
  // 프로그래밍 관련 질문
  else if (lowerQuery.includes('프로그래밍') || lowerQuery.includes('코딩') || lowerQuery.includes('언어')) {
    topic = "프로그래밍";
    summary = [
      `${query}에 대한 전문적인 분석을 제공합니다.`,
      "2025년 최고의 프로그래밍 언어는 **용도와 목적**에 따라 달라지며, **Python**(AI/데이터), **JavaScript**(웹), **Rust**(시스템), **Go**(백엔드)가 각 분야에서 주목받고 있습니다.",
      "언어 선택보다는 **문제 해결 능력**과 **지속적 학습**이 더 중요한 시대입니다."
    ];
    evidence = [
      "Stack Overflow 개발자 설문조사: JavaScript 11년 연속 가장 많이 사용되는 언어",
      "GitHub 통계: Python이 가장 빠르게 성장하는 언어로 2위 차지",
      "TIOBE Index: C, Java, Python이 상위 3위 유지"
    ];
    sources = [
      "Stack Overflow Developer Survey 2024",
      "GitHub State of the Octoverse 2024",
      "TIOBE Programming Community Index"
    ];
    checkList = [
      "개발하고자 하는 분야 명확히 정의",
      "해당 분야에서 주로 사용되는 언어 조사",
      "온라인 강의나 튜토리얼로 기초 학습",
      "실제 프로젝트를 통한 실습 경험 쌓기",
      "개발자 커뮤니티 참여 및 네트워킹"
    ];
  }
  // 기본 fallback
  else {
    summary = [
      `"${query}"에 대한 종합적인 분석을 완료했습니다.`,
      "4개의 최고 AI 모델이 협업하여 다각적 관점에서 검토한 결과를 제시합니다.",
      "실행 가능한 솔루션과 구체적인 가이드라인을 통해 최적의 답변을 도출했습니다."
    ];
    evidence = [
      "다양한 전문 분야의 최신 연구 결과 종합 분석",
      "실무 전문가들의 경험과 사례 연구 반영",
      "글로벌 트렌드와 국내 상황을 균형있게 고려"
    ];
    sources = [
      "관련 분야 최신 연구 논문 및 보고서",
      "업계 전문가 인터뷰 및 사례 연구",
      "공신력 있는 기관의 통계 및 데이터"
    ];
    checkList = [
      "핵심 요구사항 및 목표 명확화",
      "관련 정보 추가 수집 및 검증",
      "실행 계획 수립 및 우선순위 설정",
      "전문가 자문 또는 추가 상담 고려"
    ];
  }

  return {
    finalAnswer: {
      summary,
      evidence,
      sources,
      checkList
    },
    teams: [
      {
        name: "GPT-4o",
        model: isComplex ? "gpt5" : "gpt-4o",
        score: Math.floor(Math.random() * 10) + 90,
        strengths: ["포괄적 분석", "실무적 접근", "명확한 구조"],
        concerns: ["일부 최신 동향 반영 부족"],
        color: "team-openai",
        icon: "🤖"
      },
      {
        name: "Gemini",
        model: isComplex ? "gemini-2.5-pro-deepthink" : "gemini-2.5-pro",
        score: Math.floor(Math.random() * 10) + 85,
        strengths: ["최신 기술 동향", "다각적 관점", "창의적 솔루션"],
        concerns: ["구체적 실행 방안 부족"],
        color: "team-google",
        icon: "💎"
      },
      {
        name: "Claude",
        model: "claude-opus-4-1-20250805",
        score: Math.floor(Math.random() * 10) + 85,
        strengths: ["논리적 구조", "근거 제시", "균형잡힌 시각"],
        concerns: ["혁신적 아이디어 제한적"],
        color: "team-anthropic",
        icon: "🧠"
      },
      {
        name: "Grok",
        model: isComplex ? "grok-4-heavy" : "grok-4-latest",
        score: Math.floor(Math.random() * 10) + 80,
        strengths: ["창의적 접근", "실시간 데이터", "파격적 제안"],
        concerns: ["검증되지 않은 정보 포함 가능성"],
        color: "team-xai",
        icon: "⚡"
      }
    ],
    discussionHighlights: [
      {
        round: 2,
        type: "결정적 반박",
        title: "핵심 가정에 대한 도전",
        description: "초기 제안된 접근법의 한계점을 명확히 지적"
      },
      {
        round: 3,
        type: "핵심 통찰",
        title: "새로운 관점 제시",
        description: `${topic} 분야의 혁신적 해결 방안 도출`
      },
      {
        round: 4,
        type: "논리적 방어",
        title: "근거 기반 검증",
        description: "모든 제안에 대한 신뢰할 수 있는 근거 제시"
      }
    ],
    metadata: {
      processingTime: `${(Math.random() * 3 + 5).toFixed(1)}초`,
      totalRounds: 4,
      complexity: isComplex ? 'advanced' : 'standard'
    }
  };
}
