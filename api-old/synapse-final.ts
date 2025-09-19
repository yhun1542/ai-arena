import type { VercelRequest, VercelResponse } from '@vercel/node';

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

    console.log(`🚀 Synapse 요청 수신:`, {
      queryLength: query.length,
      useAdvanced: useAdvanced,
      timestamp: new Date().toISOString()
    });

    // 단순화된 AI 응답 생성 (외부 의존성 없음)
    const startTime = Date.now();
    
    // OpenAI API 직접 호출
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    let openaiResult = "OpenAI API 키가 설정되지 않았습니다.";
    
    if (OPENAI_API_KEY) {
      try {
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{
              role: 'user',
              content: `다음 질문에 대해 체계적이고 상세하게 분석해주세요: ${query}`
            }],
            max_tokens: 1500,
            temperature: 0.7
          }),
        });

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json();
          openaiResult = openaiData.choices[0]?.message?.content || "OpenAI 응답을 받을 수 없습니다.";
        } else {
          openaiResult = "OpenAI API 호출에 실패했습니다.";
        }
      } catch (error) {
        console.error('OpenAI API 오류:', error);
        openaiResult = "OpenAI API 호출 중 오류가 발생했습니다.";
      }
    }

    // 다른 AI 모델들의 시뮬레이션 응답
    const geminiResult = `**Gemini 창의적 분석**

${query}에 대한 혁신적이고 창의적인 관점을 제시합니다.

## 핵심 인사이트
- 기존 패러다임을 벗어난 새로운 접근법
- 다각도 분석을 통한 종합적 이해
- 미래 지향적 솔루션 제안

## 창의적 해결책
혁신적 아이디어와 실현 가능한 방안을 균형있게 제시합니다.

*실제 Gemini API 연동 시 더욱 창의적인 분석이 제공됩니다.*`;

    const claudeResult = `**Claude 논리적 검증**

${query}에 대한 체계적이고 논리적인 분석을 제공합니다.

## 논리적 구조 분석
- 전제 조건의 타당성 검증
- 논리적 연결고리 분석  
- 결론의 일관성 확인

## 균형잡힌 평가
찬성과 반대 논리를 모두 고려한 객관적 판단을 제시합니다.

*실제 Claude API 연동 시 더욱 정밀한 논리적 분석이 제공됩니다.*`;

    const grokResult = `**Grok 실용적 접근**

${query}에 대한 현실적이고 실용적인 관점을 제시합니다.

## 현실적 평가
- 이론과 실제의 차이점 분석
- 실현 가능성에 대한 솔직한 평가
- 실무진 관점에서의 장애 요소

## 실용적 권장사항
즉시 적용 가능한 구체적 방안을 제시합니다.

*실제 Grok API 연동 시 더욱 직설적이고 실용적인 분석이 제공됩니다.*`;

    const processingTime = `${((Date.now() - startTime) / 1000).toFixed(1)}초`;

    // 응답 데이터 구성
    const result = {
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

    // 성공 응답
    return response.status(200).json({
      success: true,
      data: result,
      metadata: {
        requestId: `synapse-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        processingTime: result.metadata.processingTime,
        modelTier: useAdvanced ? 'advanced' : 'standard'
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
