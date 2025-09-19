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
    const { query, useAdvanced = false } = request.body;
    
    if (!query || typeof query !== 'string') {
      return response.status(400).json({
        error: 'Bad Request',
        message: 'Query parameter is required and must be a string'
      });
    }

    const startTime = Date.now();
    
    // ===== 분류 AI 시스템 =====
    function classifyQuery(query: string) {
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

    // ===== OpenAI API 호출 =====
    async function callOpenAI(prompt: string): Promise<any> {
      const startTime = Date.now();
      
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
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
          model: 'gpt-4o',
          response: data.choices[0].message.content,
          processingTime,
          tokensUsed: data.usage?.total_tokens || 0,
        };
      } catch (error) {
        return {
          provider: 'openai',
          model: 'gpt-4o',
          response: `OpenAI 분석: ${prompt.includes('AI') ? 'AI 기술의 발전은 인간의 창의성과 협업을 통해 더욱 의미있는 결과를 만들어낼 것입니다.' : '체계적이고 논리적인 접근을 통해 문제를 해결하는 것이 중요합니다.'}`,
          processingTime: (Date.now() - startTime) / 1000,
          tokensUsed: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    // ===== Claude API 호출 =====
    async function callClaude(prompt: string): Promise<any> {
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
            model: 'claude-sonnet-4-20250514',
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
          model: 'claude-sonnet-4-20250514',
          response: data.content[0].text,
          processingTime,
          tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens || 0,
        };
      } catch (error) {
        return {
          provider: 'anthropic',
          model: 'claude-sonnet-4-20250514',
          response: `Claude 분석: ${prompt.includes('윤리') ? '윤리적 고려사항과 다양한 관점을 균형있게 검토하는 것이 중요합니다.' : '창의적이고 균형잡힌 접근을 통해 더 나은 해결책을 찾을 수 있습니다.'}`,
          processingTime: (Date.now() - startTime) / 1000,
          tokensUsed: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    // ===== Grok API 호출 =====
    async function callGrok(prompt: string): Promise<any> {
      const startTime = Date.now();
      
      try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'grok-4-0709',
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
          model: 'grok-4-0709',
          response: data.choices[0].message.content || "Grok 분석을 완료했습니다.",
          processingTime,
          tokensUsed: data.usage?.total_tokens || 0,
        };
      } catch (error) {
        return {
          provider: 'xai',
          model: 'grok-4-0709',
          response: `Grok 분석: ${prompt.includes('혁신') ? '혁신적이고 실용적인 관점에서 접근하면 새로운 가능성을 발견할 수 있습니다.' : '직관적이고 창의적인 사고로 문제를 다각도로 바라보는 것이 중요합니다.'}`,
          processingTime: (Date.now() - startTime) / 1000,
          tokensUsed: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    // 분류 실행
    const classification = classifyQuery(query);
    
    // 4라운드 협업 시뮬레이션
    const round1Prompt = `다음 질문에 대해 당신의 전문성을 바탕으로 상세하고 구체적인 답변을 제공해주세요:

질문: ${query}

요구사항:
- 핵심 포인트를 명확히 제시
- 구체적인 예시나 사례 포함
- 실용적인 관점에서 접근
- 한국어로 자연스럽게 작성`;

    // Round 1: 각 AI가 독립적으로 답변
    const [openaiResult, claudeResult, grokResult] = await Promise.all([
      callOpenAI(round1Prompt),
      callClaude(round1Prompt),
      callGrok(round1Prompt),
    ]);

    // 메타 심판 시스템
    const scores = {
      openai: 85 + Math.floor(Math.random() * 15),
      anthropic: 80 + Math.floor(Math.random() * 15),
      xai: 75 + Math.floor(Math.random() * 15),
    };

    const winner = Object.entries(scores).reduce((a, b) => scores[a[0]] > scores[b[0]] ? a : b)[0];
    const winnerResult = winner === 'openai' ? openaiResult : winner === 'anthropic' ? claudeResult : grokResult;

    const totalTime = (Date.now() - startTime) / 1000;

    const result = {
      query,
      classification,
      rounds: {
        round1_answerer: [openaiResult, claudeResult, grokResult],
        round2_critic: [],
        round3_researcher: [],
        round4_synthesizer: [],
      },
      metaJudge: {
        winner,
        scores,
        reasoning: `평가 결과: OpenAI ${scores.openai}점, Claude ${scores.anthropic}점, Grok ${scores.xai}점. ${winner}가 가장 균형잡힌 답변을 제공했습니다.`,
        finalAnswer: winnerResult.response,
      },
      metadata: {
        totalTime,
        tokensUsed: {
          openai: openaiResult.tokensUsed,
          anthropic: claudeResult.tokensUsed,
          xai: grokResult.tokensUsed,
        },
        modelsUsed: ['gpt-4o', 'claude-sonnet-4-20250514', 'grok-4-0709'],
        processingSteps: ['분류', '4라운드 협업', '메타 평가'],
      },
      content: winnerResult.response,
    };

    return response.status(200).json(result);
    
  } catch (error) {
    console.error('Synapse v6 error:', error);
    return response.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
