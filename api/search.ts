import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // 상관관계ID 생성 (crypto.randomUUID 사용)
  const reqId = crypto.randomUUID();
  
  // 기본 헤더 설정
  res.setHeader('x-request-id', reqId);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 메서드만 허용
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST method is supported' 
    });
  }

  // Content-Type 검증
  const contentType = req.headers['content-type'];
  if (!contentType?.includes('application/json')) {
    return res.status(400).json({ 
      error: 'Invalid content type',
      message: 'Content-Type must be application/json' 
    });
  }

  try {
    // 요청 본문 검증
    const { query } = req.body;
    
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Query is required and must be a non-empty string' 
      });
    }

    if (query.length > 20000) {
      return res.status(400).json({ 
        error: 'Query too long',
        message: 'Query cannot exceed 20,000 characters' 
      });
    }

    // 토론 ID 생성 (crypto.randomUUID 사용)
    const discussionId = crypto.randomUUID();

    // 성공 응답 - 201 Created + Location 헤더
    res.setHeader('Location', `/discussion?id=${discussionId}`);
    
    // 로깅
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'info',
      event: 'DISCUSSION_CREATED',
      reqId,
      route: '/api/search',
      method: 'POST',
      status: 201,
      discussionId,
      queryLength: query.length
    }));

    return res.status(201).json({ 
      discussionId,
      status: 'created',
      message: 'Discussion created successfully' 
    });

  } catch (error) {
    // 오류 로깅
    console.error(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'error',
      event: 'DISCUSSION_CREATE_FAILED',
      reqId,
      route: '/api/search',
      method: 'POST',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error'
    }));

    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create discussion' 
    });
  }
}
