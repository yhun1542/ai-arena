import type { NextApiRequest, NextApiResponse } from 'next';

export const config = {
  runtime: 'nodejs',
  maxDuration: 300,
};

interface AIResponse {
  model: string;
  answer: string;
  success: boolean;
  error?: string;
}

// OpenAI 직접 호출
async function callOpenAI(prompt: string): Promise<AIResponse> {
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
    return {
      model: 'GPT-4o',
      answer: data.choices[0].message.content,
      success: true,
    };
  } catch (error) {
    return {
      model: 'GPT-4o',
      answer: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Google Gemini 직접 호출
async function callGemini(prompt: string): Promise<AIResponse> {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      model: 'Gemini Pro',
      answer: data.candidates[0].content.parts[0].text,
      success: true,
    };
  } catch (error) {
    return {
      model: 'Gemini Pro',
      answer: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Claude 직접 호출
async function callClaude(prompt: string): Promise<AIResponse> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ANTHROPIC_API_KEY}`,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      model: 'Claude 3.5',
      answer: data.content[0].text,
      success: true,
    };
  } catch (error) {
    return {
      model: 'Claude 3.5',
      answer: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Grok 직접 호출
async function callGrok(prompt: string): Promise<AIResponse> {
  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      model: 'Grok Beta',
      answer: data.choices[0].message.content,
      success: true,
    };
  } catch (error) {
    return {
      model: 'Grok Beta',
      answer: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const startTime = Date.now();

  try {
    // 모든 AI 모델을 병렬로 호출
    const [openaiResult, geminiResult, claudeResult, grokResult] = await Promise.all([
      callOpenAI(query),
      callGemini(query),
      callClaude(query),
      callGrok(query),
    ]);

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // 성공한 응답들만 필터링
    const successfulResponses = [openaiResult, geminiResult, claudeResult, grokResult]
      .filter(result => result.success);

    if (successfulResponses.length === 0) {
      return res.status(500).json({
        success: false,
        error: 'All AI models failed to respond',
        details: [openaiResult, geminiResult, claudeResult, grokResult],
      });
    }

    // 가장 긴 답변을 최종 답변으로 선택
    const bestResponse = successfulResponses.reduce((best, current) => 
      current.answer.length > best.answer.length ? current : best
    );

    // 결과 페이지에서 사용할 수 있는 형태로 데이터 구성
    const result = {
      finalAnswer: {
        summary: [bestResponse.answer],
        evidence: [`${bestResponse.model}에서 제공한 답변입니다.`],
        sources: [],
        checkList: ['답변을 검토해보세요', '추가 질문이 있다면 새로운 검색을 시작하세요'],
      },
      teams: [openaiResult, geminiResult, claudeResult, grokResult].map((result, index) => ({
        name: result.model,
        model: result.model,
        score: result.success ? 95 : 0,
        strengths: result.success ? ['정상 응답'] : [],
        concerns: result.success ? [] : ['API 호출 실패'],
        finalAnswer: result.answer || '응답 없음',
        evidence: [],
        sources: [],
      })),
      highlights: [],
      metadata: {
        complexity: 'standard' as const,
        totalRounds: 1,
        processingTime: parseFloat(processingTime),
        content: query,
      },
    };

    return res.status(200).json({
      success: true,
      query,
      result,
      timestamp: new Date().toISOString(),
      processingTime: `${processingTime}초`,
      models: successfulResponses.map(r => r.model),
      method: 'synapse-direct',
    });

  } catch (error) {
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      processingTime: `${processingTime}초`,
    });
  }
}
