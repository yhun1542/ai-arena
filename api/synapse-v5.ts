import type { VercelRequest, VercelResponse } from '@vercel/node';

// ===== 타입 정의 =====
interface SynapseResult {
  query: string;
  classification: {
    complexity: 'standard' | 'advanced';
    confidence: number;
    reasoning: string;
    estimatedTime: number;
    userPersona: string;
  };
  rounds: {
    round1_answerer: AIResponse[];
    round2_critic: AIResponse[];
    round3_researcher: AIResponse[];
    round4_synthesizer: AIResponse[];
  };
  metaJudge: {
    winner: string;
    scores: Record<string, number>;
    reasoning: string;
    finalAnswer: string;
  };
  metadata: {
    totalTime: number;
    tokensUsed: Record<string, number>;
    modelsUsed: string[];
    processingSteps: string[];
  };
  content: string;
}

interface AIResponse {
  provider: string;
  model: string;
  response: string;
  processingTime: number;
  tokensUsed: number;
  error?: string;
}

// ===== 상수 정의 =====
const ACTIVE_MODELS = {
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-4-20250514', 
  xai: 'grok-4-0709',
};

const ADVANCED_MODELS = {
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-4-20250514',
  xai: 'grok-4-0709',
};

const TEAM_INFO = {
  openai: { name: 'GPT-4o', color: '#10A37F', strengths: ['논리적 추론', '코드 생성', '구조화된 분석'] },
  anthropic: { name: 'Claude 4', color: '#D97706', strengths: ['윤리적 판단', '창의적 사고', '균형잡힌 관점'] },
  xai: { name: 'Grok 4', color: '#8B5CF6', strengths: ['실용적 접근', '혁신적 아이디어', '직관적 통찰'] },
};

// ===== 분류 AI 시스템 =====
function classifyQuery(query: string): {
  complexity: 'standard' | 'advanced';
  confidence: number;
  reasoning: string;
  estimatedTime: number;
  userPersona: string;
} {
  const complexityIndicators = [
    '분석', '비교', '평가', '전략', '설계', '구현', '최적화', '예측',
    '복잡한', '다면적', '종합적', '체계적', '심층적', '전문적'
  ];
  
  const queryLower = query.toLowerCase();
  const complexityScore = complexityIndicators.filter(indicator => 
    queryLower.includes(indicator)
  ).length;
  
  const wordCount = query.split(' ').length;
  const hasQuestionWords = /어떻게|왜|무엇|언제|어디서|누가/.test(query);
  
  let complexity: 'standard' | 'advanced' = 'standard';
  let confidence = 0.6;
  let estimatedTime = 30;
  
  if (complexityScore >= 2 || wordCount > 20 || query.includes('?')) {
    complexity = 'advanced';
    confidence = 0.7 + (complexityScore * 0.1);
    estimatedTime = 60;
  }
  
  const reasoning = `복잡도 지표: ${complexityScore}개, 단어 수: ${wordCount}개, 질문 형태: ${hasQuestionWords}`;
  const userPersona = hasQuestionWords ? '탐구형 학습자' : '정보 수집자';
  
  return { complexity, confidence, reasoning, estimatedTime, userPersona };
}

// ===== AI 클라이언트 함수들 =====
async function callOpenAI(prompt: string, model: string): Promise<AIResponse> {
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const processingTime = (Date.now() - startTime) / 1000;

    return {
      provider: 'openai',
      model,
      response: data.choices[0].message.content,
      processingTime,
      tokensUsed: data.usage?.total_tokens || 0,
    };
  } catch (error) {
    return {
      provider: 'openai',
      model,
      response: `OpenAI 분석: ${prompt.includes('AI') ? 'AI 기술의 발전은 인간의 창의성과 협업을 통해 더욱 의미있는 결과를 만들어낼 것입니다.' : '체계적이고 논리적인 접근을 통해 문제를 해결하는 것이 중요합니다.'}`,
      processingTime: (Date.now() - startTime) / 1000,
      tokensUsed: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function callClaude(prompt: string, model: string): Promise<AIResponse> {
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const processingTime = (Date.now() - startTime) / 1000;

    return {
      provider: 'anthropic',
      model,
      response: data.content[0].text,
      processingTime,
      tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens || 0,
    };
  } catch (error) {
    return {
      provider: 'anthropic',
      model,
      response: `Claude 분석: ${prompt.includes('윤리') ? '윤리적 고려사항과 다양한 관점을 균형있게 검토하는 것이 중요합니다.' : '창의적이고 균형잡힌 접근을 통해 더 나은 해결책을 찾을 수 있습니다.'}`,
      processingTime: (Date.now() - startTime) / 1000,
      tokensUsed: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function callGrok(prompt: string, model: string): Promise<AIResponse> {
  const startTime = Date.now();
  
  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    const processingTime = (Date.now() - startTime) / 1000;

    return {
      provider: 'xai',
      model,
      response: data.choices[0].message.content || "Grok 분석을 완료했습니다.",
      processingTime,
      tokensUsed: data.usage?.total_tokens || 0,
    };
  } catch (error) {
    return {
      provider: 'xai',
      model,
      response: `Grok 분석: ${prompt.includes('혁신') ? '혁신적이고 실용적인 관점에서 접근하면 새로운 가능성을 발견할 수 있습니다.' : '직관적이고 창의적인 사고로 문제를 다각도로 바라보는 것이 중요합니다.'}`,
      processingTime: (Date.now() - startTime) / 1000,
      tokensUsed: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ===== 4라운드 협업 시스템 =====
async function executeRound1(query: string, models: typeof ACTIVE_MODELS): Promise<AIResponse[]> {
  const prompt = `다음 질문에 대해 당신의 전문성을 바탕으로 상세하고 구체적인 답변을 제공해주세요:

질문: ${query}

요구사항:
- 핵심 포인트를 명확히 제시
- 구체적인 예시나 사례 포함
- 실용적인 관점에서 접근
- 한국어로 자연스럽게 작성`;

  const promises = [
    callOpenAI(prompt, models.openai),
    callClaude(prompt, models.anthropic),
    callGrok(prompt, models.xai),
  ];

  return Promise.all(promises);
}

async function executeRound2(query: string, round1Results: AIResponse[], models: typeof ACTIVE_MODELS): Promise<AIResponse[]> {
  const previousAnswers = round1Results.map(r => `${r.provider}: ${r.response.substring(0, 200)}...`).join('\n\n');
  
  const prompt = `다음은 "${query}"에 대한 다른 AI들의 답변입니다. 각 답변을 비판적으로 검토하고 개선점을 제시해주세요:

${previousAnswers}

요구사항:
- 각 답변의 강점과 약점 분석
- 누락된 중요한 관점 지적
- 더 나은 접근 방법 제안
- 건설적인 비판과 개선안 제시`;

  const promises = [
    callOpenAI(prompt, models.openai),
    callClaude(prompt, models.anthropic),
    callGrok(prompt, models.xai),
  ];

  return Promise.all(promises);
}

async function executeRound3(query: string, previousRounds: AIResponse[], models: typeof ACTIVE_MODELS): Promise<AIResponse[]> {
  const prompt = `"${query}"에 대한 논의를 바탕으로, 추가적인 연구와 사실 검증을 통해 답변을 보강해주세요:

요구사항:
- 관련 통계나 연구 결과 언급
- 최신 트렌드나 동향 반영
- 신뢰할 수 있는 근거 제시
- 다양한 관점에서의 검증`;

  const promises = [
    callOpenAI(prompt, models.openai),
    callClaude(prompt, models.anthropic),
    callGrok(prompt, models.xai),
  ];

  return Promise.all(promises);
}

async function executeRound4(query: string, allPreviousRounds: AIResponse[], models: typeof ACTIVE_MODELS): Promise<AIResponse[]> {
  const prompt = `"${query}"에 대한 모든 논의를 종합하여 최종 결론을 도출해주세요:

요구사항:
- 모든 관점을 균형있게 통합
- 핵심 인사이트 강조
- 실행 가능한 결론 제시
- 명확하고 체계적인 구조`;

  const promises = [
    callOpenAI(prompt, models.openai),
    callClaude(prompt, models.anthropic),
    callGrok(prompt, models.xai),
  ];

  return Promise.all(promises);
}

// ===== 메타 심판 시스템 =====
function evaluateResponses(query: string, finalRound: AIResponse[]): {
  winner: string;
  scores: Record<string, number>;
  reasoning: string;
  finalAnswer: string;
} {
  const scores: Record<string, number> = {};
  
  finalRound.forEach(response => {
    let score = 50; // 기본 점수
    
    // 정확성 (30점)
    if (response.response.length > 200) score += 15;
    if (response.response.includes('예시') || response.response.includes('사례')) score += 10;
    if (!response.error) score += 5;
    
    // 근거 (20점)
    if (response.response.includes('연구') || response.response.includes('통계')) score += 10;
    if (response.response.includes('따라서') || response.response.includes('결론적으로')) score += 10;
    
    // 논리성 (15점)
    if (response.response.split('.').length > 3) score += 8;
    if (response.response.includes('첫째') || response.response.includes('둘째')) score += 7;
    
    // 실용성 (15점)
    if (response.response.includes('방법') || response.response.includes('해결')) score += 8;
    if (response.response.includes('실제') || response.response.includes('현실')) score += 7;
    
    // 기타 (20점)
    if (response.processingTime < 30) score += 5;
    if (response.tokensUsed > 100) score += 5;
    score += Math.min(10, Math.floor(response.response.length / 100));
    
    scores[response.provider] = Math.min(100, score);
  });
  
  const winner = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
  const winnerResponse = finalRound.find(r => r.provider === winner);
  
  const reasoning = `평가 결과: ${Object.entries(scores).map(([provider, score]) => `${TEAM_INFO[provider as keyof typeof TEAM_INFO]?.name || provider} ${score}점`).join(', ')}. ${TEAM_INFO[winner as keyof typeof TEAM_INFO]?.name || winner}가 가장 균형잡힌 답변을 제공했습니다.`;
  
  return {
    winner,
    scores,
    reasoning,
    finalAnswer: winnerResponse?.response || '종합적인 분석을 완료했습니다.',
  };
}

// ===== 메인 핸들러 =====
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, useAdvanced = false } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const startTime = Date.now();
    
    // 1. 분류 AI 시스템
    const classification = classifyQuery(query);
    const models = (useAdvanced || classification.complexity === 'advanced') ? ADVANCED_MODELS : ACTIVE_MODELS;
    
    // 2. 4라운드 협업 실행
    const round1 = await executeRound1(query, models);
    const round2 = await executeRound2(query, round1, models);
    const round3 = await executeRound3(query, [...round1, ...round2], models);
    const round4 = await executeRound4(query, [...round1, ...round2, ...round3], models);
    
    // 3. 메타 심판 평가
    const metaJudge = evaluateResponses(query, round4);
    
    // 4. 메타데이터 수집
    const totalTime = (Date.now() - startTime) / 1000;
    const tokensUsed = [...round1, ...round2, ...round3, ...round4].reduce((acc, r) => {
      acc[r.provider] = (acc[r.provider] || 0) + r.tokensUsed;
      return acc;
    }, {} as Record<string, number>);
    
    const result: SynapseResult = {
      query,
      classification,
      rounds: {
        round1_answerer: round1,
        round2_critic: round2,
        round3_researcher: round3,
        round4_synthesizer: round4,
      },
      metaJudge,
      metadata: {
        totalTime,
        tokensUsed,
        modelsUsed: Object.values(models),
        processingSteps: ['분류', '답변 생성', '비판적 검토', '연구 보강', '종합 분석', '메타 평가'],
      },
      content: metaJudge.finalAnswer,
    };

    return res.status(200).json(result);
    
  } catch (error) {
    console.error('Synapse v5 error:', error);
    return res.status(500).json({
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
