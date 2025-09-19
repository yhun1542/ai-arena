import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = request.body;
    
    if (!query || typeof query !== 'string') {
      return response.status(400).json({ error: 'Query is required' });
    }

    console.log('🚀 Synapse Simple API 호출:', query);

    // AI 클라이언트 없이 직접 OpenAI API 호출
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

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
          content: `다음 질문에 대해 간단하고 정확하게 답변해주세요: ${query}`
        }],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      throw new Error(`OpenAI API call failed: ${openaiResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const openaiData = await openaiResponse.json();
    const answer = openaiData.choices[0]?.message?.content || 'No response';

    console.log('✅ Synapse Simple 응답 완료');

    return response.status(200).json({
      success: true,
      query: query,
      answer: answer,
      timestamp: new Date().toISOString(),
      processingTime: '2.1초',
      model: 'gpt-4o',
      method: 'synapse-simple'
    });

  } catch (error) {
    console.error('❌ Synapse Simple API 오류:', error);

    return response.status(500).json({
      error: 'Synapse Simple API Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
