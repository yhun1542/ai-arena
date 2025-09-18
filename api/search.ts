// api/search.ts

// 1. Vercel의 타입을 명확하게 import 합니다.
import type { VercelRequest, VercelResponse } from '@vercel/node';
// 2. uuid를 ES Module 방식으로 안전하게 import 합니다.
import { v4 as uuidv4 } from 'uuid';

export default function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // 상관관계ID 추가
  const requestId = uuidv4();
  
  try {
    // CORS 헤더 설정
    response.setHeader('x-request-id', requestId);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.setHeader('Content-Type', 'application/json');

    // OPTIONS 요청 처리 (CORS preflight)
    if (request.method === 'OPTIONS') {
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        level: 'info',
        event: 'CORS_PREFLIGHT',
        reqId: requestId,
        route: '/api/search',
        method: 'OPTIONS',
        status: 200
      }));
      return response.status(200).end();
    }

    // POST 메서드만 허용
    if (request.method !== 'POST') {
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        level: 'warn',
        event: 'METHOD_NOT_ALLOWED',
        reqId: requestId,
        route: '/api/search',
        method: request.method,
        status: 405
      }));
      response.setHeader('Allow', 'POST');
      return response.status(405).json({ error: 'Method not allowed' });
    }

    // Content-Type 검증
    const contentType = request.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        level: 'warn',
        event: 'INVALID_CONTENT_TYPE',
        reqId: requestId,
        route: '/api/search',
        method: 'POST',
        contentType: contentType,
        status: 400
      }));
      return response.status(400).json({ error: 'Content-Type must be application/json' });
    }

    // 요청 본문 파싱 및 검증
    let parsedBody;
    try {
      parsedBody = request.body;
      if (typeof parsedBody === 'string') {
        parsedBody = JSON.parse(parsedBody);
      }
    } catch (parseError) {
      console.error(JSON.stringify({
        ts: new Date().toISOString(),
        level: 'error',
        event: 'JSON_PARSE_ERROR',
        reqId: requestId,
        route: '/api/search',
        method: 'POST',
        status: 400,
        error: parseError instanceof Error ? parseError.message : 'JSON parse failed'
      }));
      return response.status(400).json({ error: 'Invalid JSON in request body' });
    }

    const { query } = parsedBody ?? {};
    const q = (query ?? '').trim();

    // 쿼리 검증
    if (!q || typeof q !== 'string') {
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        level: 'warn',
        event: 'INVALID_QUERY',
        reqId: requestId,
        route: '/api/search',
        method: 'POST',
        status: 400,
        queryType: typeof q,
        queryLength: q ? q.length : 0
      }));
      return response.status(400).json({ error: 'Query is required and must be a string' });
    }

    if (q.length > 20000) {
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        level: 'warn',
        event: 'QUERY_TOO_LONG',
        reqId: requestId,
        route: '/api/search',
        method: 'POST',
        status: 400,
        queryLength: q.length
      }));
      return response.status(400).json({ error: 'Query too long (max 20000 characters)' });
    }

    // 토론 ID 생성
    const discussionId = uuidv4();
    
    // 성공 로깅
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'info',
      event: 'DISCUSSION_CREATED',
      reqId: requestId,
      route: '/api/search',
      method: 'POST',
      status: 201,
      queryLength: q.length,
      discussionId: discussionId
    }));

    // 응답 헤더 설정
    response.setHeader('Location', `/discussion?id=${encodeURIComponent(discussionId)}`);
    
    // 성공 응답
    return response.status(201).json({ 
      discussionId: discussionId, 
      status: 'created',
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    // 예상치 못한 오류 처리
    console.error(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'error',
      event: 'UNEXPECTED_ERROR',
      reqId: requestId,
      route: '/api/search',
      method: request.method,
      status: 500,
      error: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace'
    }));
    
    return response.status(500).json({ 
      error: 'Internal server error',
      requestId: requestId
    });
  }
}
