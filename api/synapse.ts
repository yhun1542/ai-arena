import type { VercelRequest, VercelResponse } from '@vercel/node';
import { runDirectSynapseProcess } from '../lib/direct-synapse';

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

    // 간단한 직접 API 호출 방식으로 변경
    const result = await runDirectSynapseProcess(query, shouldUseAdvanced, persona);houldUseAdvanced,
      persona: persona || {
        level: 'intermediate',
        tone: 'formal',
        length: 'detailed'
      }
    });

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
