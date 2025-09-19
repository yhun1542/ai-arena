// pages/api/synapse-simple.ts - OpenAI 중심 단순화 버전
import type { NextApiRequest, NextApiResponse } from 'next';

// Node.js 런타임 강제
export const runtime = 'nodejs';

interface AIResponse {
  modelId: string;
  content: string;
  score: number;
  processingTime: number;
  confidence: number;
  strengths: string[];
  concerns: string[];
  metadata: {
    tokenCount: number;
    cost: number;
  };
}

// OpenAI API 호출
async function callOpenAI(prompt: string, model = 'gpt-4o'): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '';
}

// 다중 GPT 모델 시뮬레이션 (다양한 temperature와 프롬프트로)
async function simulateMultipleAI(query: string): Promise<AIResponse[]> {
  const models = [
    { id: 'gpt-4o-analyst', name: 'GPT-4o 분석가', temperature: 0.3, specialty: '논리적 분석' },
    { id: 'gpt-4o-creative', name: 'GPT-4o 창작가', temperature: 0.8, specialty: '창의적 사고' },
    { id: 'gpt-4o-practical', name: 'GPT-4o 실무가', temperature: 0.5, specialty: '실용적 해결' },
    { id: 'gpt-4o-critic', name: 'GPT-4o 비평가', temperature: 0.4, specialty: '비판적 검토' }
  ];

  const responses = await Promise.all(
    models.map(async (model) => {
      const startTime = Date.now();
      let content = '';
      let error = null;

      try {
        // 각 모델별로 다른 프롬프트 스타일 적용
        let enhancedPrompt = query;
        switch (model.id) {
          case 'gpt-4o-analyst':
            enhancedPrompt = `다음 질문을 논리적이고 체계적으로 분석해주세요:\n\n${query}`;
            break;
          case 'gpt-4o-creative':
            enhancedPrompt = `다음 질문에 대해 창의적이고 혁신적인 관점에서 답변해주세요:\n\n${query}`;
            break;
          case 'gpt-4o-practical':
            enhancedPrompt = `다음 질문에 대해 실용적이고 실행 가능한 해결책을 제시해주세요:\n\n${query}`;
            break;
          case 'gpt-4o-critic':
            enhancedPrompt = `다음 질문에 대해 비판적 사고를 바탕으로 다각도로 검토해주세요:\n\n${query}`;
            break;
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: enhancedPrompt }],
            max_tokens: 800,
            temperature: model.temperature
          })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        content = data?.choices?.[0]?.message?.content || '';

      } catch (err) {
        error = err;
        content = `[${model.name} 오류: ${err instanceof Error ? err.message : 'Unknown error'}]`;
      }

      const processingTime = Date.now() - startTime;

      return {
        modelId: model.id,
        content: content || '[응답 없음]',
        score: error ? 0 : Math.random() * 0.3 + 0.7, // 0.7-1.0 사이
        processingTime,
        confidence: error ? 0 : Math.random() * 0.2 + 0.8, // 0.8-1.0 사이
        strengths: [model.specialty],
        concerns: error ? ['API 호출 실패'] : [],
        metadata: {
          tokenCount: Math.floor((content?.length || 0) / 4),
          cost: 0.001
        }
      };
    })
  );

  return responses;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, mode = 'parallel', useAdvanced = false } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required' });
    }

    if (query.length < 10 || query.length > 2000) {
      return res.status(400).json({ 
        error: 'Query must be between 10 and 2000 characters' 
      });
    }

    console.log(`🚀 Synapse Simple 요청: ${query.substring(0, 100)}...`);

    // 다중 AI 시뮬레이션 실행
    const responses = await simulateMultipleAI(query);

    // 성공한 응답만 필터링
    const successfulResponses = responses.filter(r => r.score > 0);
    
    if (successfulResponses.length === 0) {
      return res.status(500).json({ 
        error: 'All AI models failed to respond',
        details: responses.map(r => ({ modelId: r.modelId, error: r.concerns }))
      });
    }

    // 최고 점수 응답 선택
    const bestResponse = successfulResponses.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    const result = {
      query,
      mode,
      timestamp: new Date().toISOString(),
      totalModels: responses.length,
      successfulModels: successfulResponses.length,
      bestResponse,
      allResponses: responses,
      summary: {
        averageScore: successfulResponses.reduce((sum, r) => sum + r.score, 0) / successfulResponses.length,
        totalProcessingTime: responses.reduce((sum, r) => sum + r.processingTime, 0),
        consensus: successfulResponses.length >= 2 ? 'High' : 'Low'
      }
    };

    console.log(`✅ Synapse Simple 완료: ${successfulResponses.length}/${responses.length} 모델 성공`);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('❌ Synapse Simple API 오류:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
