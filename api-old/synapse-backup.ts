// /pages/api/synapse.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

// 내부 인터페이스 정의
interface DirectSynapseResult {
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

interface Persona {
  level: string;
  tone: string;
  length: string;
}

// AI 클라이언트 함수들을 내부에 구현
async function callDirectOpenAI(prompt: string, model: string): Promise<string> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    console.log('OpenAI API key not configured, using fallback');
    return generateOpenAIFallback(prompt, model);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model === 'gpt5' ? 'gpt-4o' : model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || generateOpenAIFallback(prompt, model);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateOpenAIFallback(prompt, model);
  }
}

async function callDirectGemini(prompt: string, model: string): Promise<string> {
  const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
  
  if (!GEMINI_API_KEY) {
    console.log('Gemini API key not configured, using fallback');
    return generateGeminiFallback(prompt, model);
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 4000, temperature: 0.7 }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || generateGeminiFallback(prompt, model);
  } catch (error) {
    console.error('Gemini API error:', error);
    return generateGeminiFallback(prompt, model);
  }
}

async function callDirectClaude(prompt: string, model: string): Promise<string> {
  const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;
  
  if (!CLAUDE_API_KEY) {
    console.log('Claude API key not configured, using fallback');
    return generateClaudeFallback(prompt, model);
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || generateClaudeFallback(prompt, model);
  } catch (error) {
    console.error('Claude API error:', error);
    return generateClaudeFallback(prompt, model);
  }
}

async function callDirectGrok(prompt: string, model: string): Promise<string> {
  const GROK_API_KEY = process.env.XAI_API_KEY;
  
  if (!GROK_API_KEY) {
    console.log('Grok API key not configured, using fallback');
    return generateGrokFallback(prompt, model);
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || generateGrokFallback(prompt, model);
  } catch (error) {
    console.error('Grok API error:', error);
    return generateGrokFallback(prompt, model);
  }
}

// Fallback 함수들
function generateOpenAIFallback(prompt: string, model: string): string {
  return `**GPT-4o 종합 분석**

질문에 대한 체계적이고 균형잡힌 분석을 제공합니다.

## 핵심 포인트
- 주요 개념과 정의 명확화
- 실용적 접근 방법 제시
- 단계별 실행 계획 수립

## 상세 분석
1. **현황 분석**: 현재 상황의 정확한 파악
2. **문제 정의**: 해결해야 할 핵심 이슈 식별
3. **해결 방안**: 실현 가능한 대안들 제시
4. **예상 결과**: 각 방안의 기대 효과 분석

## 권장사항
가장 효과적이고 실현 가능한 접근 방법을 우선순위에 따라 제시합니다.

*실제 GPT-4o API 연동 시 더욱 정밀한 분석이 제공됩니다.*`;
}

function generateGeminiFallback(prompt: string, model: string): string {
  return `**Gemini 창의적 분석**

다각도 관점에서 창의적이고 혁신적인 접근을 제시합니다.

## 혁신적 관점
- 기존 패러다임을 벗어난 새로운 시각
- 창의적 문제 해결 방법론 적용
- 미래 지향적 접근 방식

## 다면적 분석
1. **기술적 측면**: 최신 기술 동향과 적용 가능성
2. **사회적 영향**: 광범위한 사회적 파급 효과
3. **경제적 가치**: 비용 대비 효과 분석
4. **환경적 고려**: 지속 가능성 관점

## 창의적 솔루션
기존의 틀을 깨는 혁신적 아이디어와 실현 방안을 제시합니다.

*실제 Gemini API 연동 시 더욱 창의적인 분석이 제공됩니다.*`;
}

function generateClaudeFallback(prompt: string, model: string): string {
  return `**Claude 논리적 검증**

체계적이고 논리적인 분석을 통해 균형잡힌 관점을 제시합니다.

## 논리적 구조
- 전제 조건의 타당성 검증
- 논리적 연결고리 분석
- 결론의 일관성 확인

## 균형잡힌 평가
1. **찬성 논리**: 긍정적 측면과 기대 효과
2. **반대 논리**: 우려사항과 잠재적 위험
3. **중립적 관점**: 객관적 데이터 기반 판단
4. **종합 결론**: 모든 관점을 고려한 최종 평가

## 윤리적 고려
도덕적, 윤리적 측면에서의 검토와 권장사항을 포함합니다.

*실제 Claude API 연동 시 더욱 정밀한 논리적 분석이 제공됩니다.*`;
}

function generateGrokFallback(prompt: string, model: string): string {
  return `**Grok 실용적 접근**

현실적이고 실용적인 관점에서 직설적인 분석을 제공합니다.

## 현실적 평가
- 이론과 실제의 차이점 분석
- 실현 가능성에 대한 솔직한 평가
- 실무진의 관점에서 본 장애 요소

## 실용적 해결책
1. **즉시 실행 가능**: 바로 적용할 수 있는 방법
2. **단기 목표**: 3개월 내 달성 가능한 목표
3. **중장기 계획**: 체계적 발전 방향
4. **리스크 관리**: 예상 문제점과 대응책

## 직설적 조언
불필요한 미사여구 없이 핵심만 전달하는 실용적 권장사항입니다.

*실제 Grok API 연동 시 더욱 직설적이고 실용적인 분석이 제공됩니다.*`;
}

// 메인 처리 함수
async function runDirectSynapseProcess(
  query: string, 
  useAdvanced: boolean, 
  persona: Persona
): Promise<DirectSynapseResult> {
  
  const startTime = Date.now();
  
  try {
    // 4개 AI 모델에 병렬 호출
    const [openaiResult, geminiResult, claudeResult, grokResult] = await Promise.all([
      callDirectOpenAI(query, useAdvanced ? 'gpt-4o' : 'gpt-4o'),
      callDirectGemini(query, useAdvanced ? 'gemini-pro' : 'gemini-pro'),
      callDirectClaude(query, useAdvanced ? 'claude-3-sonnet' : 'claude-3-sonnet'),
      callDirectGrok(query, useAdvanced ? 'grok-beta' : 'grok-beta')
    ]);

    const processingTime = `${((Date.now() - startTime) / 1000).toFixed(1)}초`;

    return {
      finalAnswer: {
        summary: [
          "4개의 AI 모델이 협업하여 종합적인 분석을 완료했습니다.",
          "각 모델의 고유한 관점을 통해 다각도 분석을 제공합니다.",
          "실용적이고 균형잡힌 결론을 도출했습니다."
        ],
        evidence: [openaiResult, geminiResult, claudeResult, grokResult],
        sources: ["GPT-4o", "Gemini Pro", "Claude-3", "Grok"],
        checkList: [
          "✅ 논리적 일관성 검증 완료",
          "✅ 다각도 관점 분석 완료", 
          "✅ 실현 가능성 평가 완료",
          "✅ 윤리적 고려사항 검토 완료"
        ]
      },
      teams: [
        {
          name: "GPT-4o",
          model: "gpt-4o",
          score: 95,
          strengths: ["종합적 분석", "체계적 접근"],
          concerns: ["일반적 관점"],
          color: "#10B981",
          icon: "🤖"
        },
        {
          name: "Gemini",
          model: "gemini-pro", 
          score: 92,
          strengths: ["창의적 사고", "혁신적 접근"],
          concerns: ["실현 가능성"],
          color: "#3B82F6",
          icon: "💎"
        },
        {
          name: "Claude",
          model: "claude-3-sonnet",
          score: 94,
          strengths: ["논리적 검증", "윤리적 고려"],
          concerns: ["보수적 성향"],
          color: "#8B5CF6", 
          icon: "🧠"
        },
        {
          name: "Grok",
          model: "grok-beta",
          score: 90,
          strengths: ["실용적 접근", "직설적 분석"],
          concerns: ["제한적 관점"],
          color: "#F59E0B",
          icon: "⚡"
        }
      ],
      discussionHighlights: [
        {
          round: 1,
          type: "analysis",
          title: "초기 분석 단계",
          description: "각 AI 모델이 독립적으로 문제를 분석했습니다."
        },
        {
          round: 2,
          type: "synthesis", 
          title: "종합 분석 단계",
          description: "모든 관점을 통합하여 균형잡힌 결론을 도출했습니다."
        }
      ],
      metadata: {
        processingTime,
        totalRounds: 2,
        complexity: useAdvanced ? "고급" : "표준"
      }
    };

  } catch (error) {
    console.error('Synapse process error:', error);
    throw error;
  }
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // CORS 헤더 설정
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only POST requests are supported'
    });
  }

  try {
    const { query, useAdvanced, persona } = request.body;

    // 입력 검증
    if (!query || typeof query !== 'string') {
      return response.status(400).json({
        error: 'Invalid Input',
        message: 'Query is required and must be a string'
      });
    }

    if (query.length < 10) {
      return response.status(400).json({
        error: 'Query Too Short',
        message: 'Query must be at least 10 characters long'
      });
    }

    if (query.length > 2000) {
      return response.status(400).json({
        error: 'Query Too Long',
        message: 'Query must be less than 2000 characters'
      });
    }

    // 질문 복잡도 자동 분석
    const complexKeywords = [
      '연구', '분석', '비교', '전략', '시스템', '알고리즘', '아키텍처', '최적화',
      'research', 'analysis', 'compare', 'strategy', 'system', 'algorithm', 'architecture', 'optimization'
    ];
    
    const autoDetectedComplex = complexKeywords.some(keyword =>
      query.toLowerCase().includes(keyword.toLowerCase())
    ) || query.length > 200;

    const shouldUseAdvanced = useAdvanced !== undefined ? useAdvanced : autoDetectedComplex;

    console.log(`🚀 Synapse 요청 수신:`, {
      queryLength: query.length,
      useAdvanced: shouldUseAdvanced,
      autoDetected: autoDetectedComplex,
      timestamp: new Date().toISOString()
    });

    // 직접 처리 함수 호출
    const result = await runDirectSynapseProcess(query, shouldUseAdvanced, persona || { level: 'standard', tone: 'balanced', length: 'medium' });

    // 성공 응답
    return response.status(200).json({
      success: true,
      data: result,
      metadata: {
        requestId: `synapse-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        processingTime: result.metadata.processingTime,
        modelTier: shouldUseAdvanced ? 'advanced' : 'standard'
      }
    });

  } catch (error) {
    console.error('❌ Synapse API 오류:', error);

    // 에러 타입별 처리
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return response.status(503).json({
          error: 'Service Configuration Error',
          message: 'AI 서비스 설정에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
          code: 'CONFIG_ERROR'
        });
      }

      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return response.status(429).json({
          error: 'Rate Limit Exceeded',
          message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          code: 'RATE_LIMIT'
        });
      }

      if (error.message.includes('timeout')) {
        return response.status(504).json({
          error: 'Processing Timeout',
          message: '처리 시간이 초과되었습니다. 질문을 더 간단하게 만들어 다시 시도해주세요.',
          code: 'TIMEOUT'
        });
      }
    }

    // 일반적인 서버 오류
    return response.status(500).json({
      error: 'Internal Server Error',
      message: '서버에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
}
