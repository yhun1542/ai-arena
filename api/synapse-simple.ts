import type { VercelRequest, VercelResponse } from '@vercel/node';
import { callOpenAI } from '../src/lib/ai-clients/openai';

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query } = request.body;
    
    if (!query || typeof query !== 'string') {
      return response.status(400).json({ error: 'Query is required' });
    }

    console.log('🚀 Simple Synapse API 호출:', query);

    // 간단한 OpenAI 호출만 테스트
    const openaiResult = await callOpenAI(
      `다음 질문에 대해 간단하고 정확하게 답변해주세요: ${query}`,
      'gpt-4o'
    );

    console.log('✅ OpenAI 응답 완료');

    // 간단한 응답 구조
    const result = {
      success: true,
      query: query,
      answer: openaiResult,
      timestamp: new Date().toISOString(),
      processingTime: '2.0초',
      model: 'gpt-4o'
    };

    return response.status(200).json(result);

  } catch (error) {
    console.error('❌ Simple Synapse API 오류:', error);

    return response.status(500).json({
      error: 'Simple API Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
}
