import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 환경 변수 확인
    const envCheck = {
      OPENAI_API_KEY: !!process.env.OPENAI_API_KEY ? 'SET' : 'NOT_SET',
      GOOGLE_API_KEY: !!process.env.GOOGLE_API_KEY ? 'SET' : 'NOT_SET', 
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY ? 'SET' : 'NOT_SET',
      XAI_API_KEY: !!process.env.XAI_API_KEY ? 'SET' : 'NOT_SET',
      
      // 키의 앞 4자리만 표시 (보안)
      OPENAI_PREFIX: process.env.OPENAI_API_KEY?.substring(0, 4) || 'NONE',
      GOOGLE_PREFIX: process.env.GOOGLE_API_KEY?.substring(0, 4) || 'NONE',
      ANTHROPIC_PREFIX: process.env.ANTHROPIC_API_KEY?.substring(0, 4) || 'NONE',
      XAI_PREFIX: process.env.XAI_API_KEY?.substring(0, 4) || 'NONE',
    };

    // 간단한 OpenAI API 테스트
    let openaiTest = 'NOT_TESTED';
    if (process.env.OPENAI_API_KEY) {
      try {
        const testResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: 'Hello' }],
            max_tokens: 10
          }),
        });
        
        openaiTest = testResponse.ok ? 'SUCCESS' : `ERROR_${testResponse.status}`;
      } catch (error) {
        openaiTest = `FETCH_ERROR: ${error instanceof Error ? error.message : 'Unknown'}`;
      }
    }

    return response.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: envCheck,
      openaiTest,
      message: 'Environment variables test completed'
    });

  } catch (error) {
    console.error('❌ Environment test error:', error);
    
    return response.status(500).json({
      error: 'Environment Test Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
