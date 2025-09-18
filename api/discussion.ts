// api/discussion.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';

export default function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // 상관관계ID 추가
  const requestId = uuidv4();
  response.setHeader('x-request-id', requestId);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리 (CORS preflight)
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).end();
  }

  try {
    // 쿼리 파라미터에서 토론 ID 추출
    const { id } = request.query;
    
    if (!id || typeof id !== 'string') {
      return response.status(400).json({ 
        error: 'Missing discussion ID',
        message: 'Discussion ID is required as query parameter' 
      });
    }

    // UUID 형식 검증 (간단한 체크)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return response.status(400).json({ 
        error: 'Invalid discussion ID format',
        message: 'Discussion ID must be a valid UUID' 
      });
    }

    // 로깅
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'info',
      event: 'DISCUSSION_RETRIEVED',
      reqId: requestId,
      route: '/api/discussion',
      method: 'GET',
      status: 200,
      discussionId: id
    }));

    // 토론 정보 반환 (실제로는 데이터베이스에서 조회)
    return response.status(200).json({
      discussionId: id,
      status: 'active',
      title: '토론이 시작되었습니다',
      createdAt: new Date().toISOString(),
      participants: ['AI Assistant', 'Human User'],
      message: 'AI 응답 받기 버튼을 클릭하여 스트리밍을 시작하세요.'
    });

  } catch (error) {
    // 오류 로깅
    console.error(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'error',
      event: 'DISCUSSION_RETRIEVE_FAILED',
      reqId: requestId,
      route: '/api/discussion',
      method: 'GET',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error'
    }));

    return response.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to retrieve discussion' 
    });
  }
}
