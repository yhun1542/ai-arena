import type { VercelRequest, VercelResponse } from '@vercel/node';
import { orchestrate } from '../src/lib/orchestrator-v3';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // CORS 헤더 설정
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
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
    console.log('🚀 Synapse v3 API 요청 수신:', {
      timestamp: new Date().toISOString(),
      body: request.body
    });

    const { query, useAdvanced, persona } = request.body;

    // 입력 검증
    if (!query || typeof query !== 'string') {
      return response.status(400).json({
        error: 'Bad Request',
        message: 'Query is required and must be a string'
      });
    }

    if (query.trim().length < 10) {
      return response.status(400).json({
        error: 'Bad Request',
        message: 'Query must be at least 10 characters long'
      });
    }

    // Synapse 오케스트레이터 실행
    console.log('🧠 Synapse 오케스트레이터 시작...');
    const result = await orchestrate({
      query: query.trim(),
      useAdvanced: useAdvanced || false,
      persona: persona || {
        level: 'intermediate',
        tone: 'formal',
        length: 'detailed'
      }
    });

    console.log('✅ Synapse 프로세스 완료:', {
      complexity: result.metadata.complexity,
      processingTime: result.metadata.processingTime,
      teamsCount: result.teams.length
    });

    // 성공 응답
    return response.status(200).json({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        version: 'v3',
        processingTime: result.metadata.processingTime
      }
    });

  } catch (error) {
    console.error('❌ Synapse API 오류:', error);

    // 에러 타입별 처리
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return response.status(503).json({
          error: 'Service Configuration Error',
          message: 'AI 서비스 설정에 문제가 있습니다.',
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
        return response.status(408).json({
          error: 'Request Timeout',
          message: '처리 시간이 초과되었습니다. 더 간단한 질문으로 다시 시도해주세요.',
          code: 'TIMEOUT'
        });
      }
    }

    // 일반적인 서버 오류
    return response.status(500).json({
      error: 'Internal Server Error',
      message: 'Synapse 처리 중 오류가 발생했습니다.',
      code: 'SYNAPSE_ERROR',
      timestamp: new Date().toISOString()
    });
  }
}
