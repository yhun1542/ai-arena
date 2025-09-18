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
  response.setHeader('x-request-id', requestId);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리 (CORS preflight)
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).end();
  }

  const contentType = request.headers['content-type'] || '';
  if (!contentType.includes('application/json')) {
    return response.status(400).json({ error: 'Content-Type must be application/json' });
  }

  try {
    const { query } = request.body ?? {};
    const q = (query ?? '').trim();

    if (!q || typeof q !== 'string' || q.length > 20000) {
      return response.status(400).json({ error: 'Invalid query provided' });
    }

    const id = uuidv4();
    
    // 로깅 (민감정보 제외)
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'info',
      event: 'DISCUSSION_CREATED',
      reqId: requestId,
      route: '/api/search',
      method: 'POST',
      status: 201,
      queryLength: q.length,
      discussionId: id
    }));

    response.setHeader('Location', `/discussion?id=${encodeURIComponent(id)}`);
    return response.status(201).json({ discussionId: id, status: 'created' });
    
  } catch (e: any) {
    // 오류 로깅
    console.error(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'error',
      event: 'DISCUSSION_CREATE_FAILED',
      reqId: requestId,
      route: '/api/search',
      method: 'POST',
      status: 400,
      error: e?.message || 'Invalid JSON'
    }));
    
    return response.status(400).json({ error: 'Invalid JSON in request body' });
  }
}
