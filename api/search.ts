import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';

// 로깅 유틸리티
const logger = {
  info: (event: string, data: any) => {
    const logEntry = {
      ts: new Date().toISOString(),
      level: 'info',
      event,
      ...data
    };
    console.log(JSON.stringify(logEntry));
  },
  error: (event: string, data: any) => {
    const logEntry = {
      ts: new Date().toISOString(),
      level: 'error',
      event,
      ...data
    };
    console.error(JSON.stringify(logEntry));
  }
};

export default function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  const reqId = uuidv4();
  
  // 상관관계ID 헤더 설정
  res.setHeader('x-request-id', reqId);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 메서드만 허용
  if (req.method !== 'POST') {
    logger.error('SEARCH_BAD_METHOD', {
      reqId,
      route: '/api/search',
      method: req.method,
      durationMs: Date.now() - startTime,
      status: 405
    });

    res.setHeader('Allow', 'POST');
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST method is supported' 
    });
  }

  // Content-Type 검증
  if (req.headers['content-type'] !== 'application/json') {
    logger.error('SEARCH_BAD_CONTENT_TYPE', {
      reqId,
      route: '/api/search',
      method: 'POST',
      durationMs: Date.now() - startTime,
      status: 400,
      contentType: req.headers['content-type']
    });

    return res.status(400).json({ 
      error: 'Invalid content type',
      message: 'Content-Type must be application/json' 
    });
  }

  // 요청 본문 검증
  const { query } = req.body;
  
  if (!query || typeof query !== 'string' || !query.trim()) {
    logger.error('SEARCH_BAD_INPUT', {
      reqId,
      route: '/api/search',
      method: 'POST',
      durationMs: Date.now() - startTime,
      status: 400,
      queryLength: query ? query.length : 0
    });

    return res.status(400).json({ 
      error: 'Invalid input',
      message: 'Query is required and must be a non-empty string' 
    });
  }

  if (query.length > 20000) {
    logger.error('SEARCH_BAD_INPUT', {
      reqId,
      route: '/api/search',
      method: 'POST',
      durationMs: Date.now() - startTime,
      status: 400,
      queryLength: query.length,
      reason: 'Query too long'
    });

    return res.status(400).json({ 
      error: 'Query too long',
      message: 'Query cannot exceed 20,000 characters' 
    });
  }

  try {
    // 토론 ID 생성 (실제로는 데이터베이스에 저장)
    const discussionId = uuidv4();

    // 성공 응답 - 201 Created + Location 헤더
    logger.info('DISCUSSION_CREATED', {
      reqId,
      route: '/api/search',
      method: 'POST',
      durationMs: Date.now() - startTime,
      status: 201,
      discussionId,
      queryLength: query.length
    });

    res.setHeader('Location', `/discussion?id=${discussionId}`);
    return res.status(201).json({ 
      discussionId,
      message: 'Discussion created successfully' 
    });

  } catch (error) {
    logger.error('DISCUSSION_CREATE_FAILED', {
      reqId,
      route: '/api/search',
      method: 'POST',
      durationMs: Date.now() - startTime,
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create discussion' 
    });
  }
}
