import type { VercelRequest, VercelResponse } from '@vercel/node';
import { orchestrateV4 } from '../src/lib/orchestrator-v4';

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
    console.log('🚀 Synapse v4 API 요청 수신:', {
      timestamp: new Date().toISOString(),
      body: request.body
    });

    const { query, useAdvanced, persona, userContext } = request.body;

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

    if (query.trim().length > 2000) {
      return response.status(400).json({
        error: 'Bad Request',
        message: 'Query is too long (maximum 2000 characters)'
      });
    }

    // 환경 변수 확인
    const requiredEnvVars = ['OPENAI_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY', 'ANTHROPIC_API_KEY', 'XAI_API_KEY'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missingEnvVars.length > 0) {
      console.warn('⚠️ 일부 API 키가 설정되지 않음:', missingEnvVars);
      // 모든 키가 없으면 에러, 일부만 없으면 경고와 함께 진행
      if (missingEnvVars.length === requiredEnvVars.length) {
        return response.status(503).json({
          error: 'Service Configuration Error',
          message: 'AI 서비스 설정이 완료되지 않았습니다.',
          code: 'CONFIG_ERROR'
        });
      }
    }

    // Synapse v4 오케스트레이터 실행
    console.log('🧠 Synapse v4 오케스트레이터 시작...');
    const result = await orchestrateV4({
      query: query.trim(),
      useAdvanced: useAdvanced || false,
      persona: persona || {
        level: 'intermediate',
        tone: 'formal',
        length: 'detailed'
      },
      userContext: userContext || {}
    });

    console.log('✅ Synapse v4 프로세스 완료:', {
      complexity: result.metadata.complexity,
      processingTime: result.metadata.processingTime,
      teamsCount: result.teams.length,
      totalTokens: result.metadata.totalTokensUsed,
      averageConfidence: result.metadata.averageConfidence
    });

    // 성공 응답
    return response.status(200).json({
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
        version: 'v4',
        processingTime: result.metadata.processingTime,
        apiVersion: '2025-01-19',
        features: [
          'multi-ai-collaboration',
          'classification-ai',
          'meta-judging',
          'real-time-all-models'
        ]
      }
    });

  } catch (error) {
    console.error('❌ Synapse v4 API 오류:', error);

    // 에러 타입별 세분화된 처리
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      // API 키 관련 오류
      if (errorMessage.includes('api key') || errorMessage.includes('unauthorized')) {
        return response.status(503).json({
          error: 'Service Configuration Error',
          message: 'AI 서비스 인증에 문제가 있습니다.',
          code: 'AUTH_ERROR',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }

      // 요청 제한 오류
      if (errorMessage.includes('rate limit') || errorMessage.includes('quota') || errorMessage.includes('429')) {
        return response.status(429).json({
          error: 'Rate Limit Exceeded',
          message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          code: 'RATE_LIMIT',
          retryAfter: 60
        });
      }

      // 타임아웃 오류
      if (errorMessage.includes('timeout') || errorMessage.includes('time out')) {
        return response.status(408).json({
          error: 'Request Timeout',
          message: '처리 시간이 초과되었습니다. 더 간단한 질문으로 다시 시도해주세요.',
          code: 'TIMEOUT'
        });
      }

      // 네트워크 오류
      if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        return response.status(502).json({
          error: 'Network Error',
          message: 'AI 서비스와의 연결에 문제가 있습니다.',
          code: 'NETWORK_ERROR'
        });
      }

      // JSON 파싱 오류
      if (errorMessage.includes('json') || errorMessage.includes('parse')) {
        return response.status(502).json({
          error: 'Response Format Error',
          message: 'AI 서비스 응답 형식에 문제가 있습니다.',
          code: 'FORMAT_ERROR'
        });
      }
    }

    // 일반적인 서버 오류
    return response.status(500).json({
      error: 'Internal Server Error',
      message: 'Synapse 처리 중 예상치 못한 오류가 발생했습니다.',
      code: 'SYNAPSE_ERROR',
      timestamp: new Date().toISOString(),
      requestId: Math.random().toString(36).substring(7)
    });
  }
}
