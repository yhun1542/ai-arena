import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 상관관계ID 생성
  const reqId = crypto.randomUUID();
  
  // 기본 헤더 설정
  res.setHeader('x-request-id', reqId);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리 (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET 메서드만 허용
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET method is supported' 
    });
  }

  // 스트리밍을 위한 헤더 설정
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Connection', 'keep-alive');

  // 로깅
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    level: 'info',
    event: 'STREAM_STARTED',
    reqId,
    route: '/api/stream',
    method: 'GET',
    status: 200
  }));

  const messages = [
    'AI Arena 스트리밍 테스트 시작...\n',
    '토론 주제를 분석하고 있습니다.\n',
    '다양한 관점을 고려하여 응답을 준비 중입니다.\n',
    '인공지능과 인간의 협력 관계를 탐구합니다.\n',
    '미래 사회에서의 역할 분담을 검토합니다.\n',
    '스트리밍 응답이 완료되었습니다.\n'
  ];

  try {
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      res.write(message);
      
      // 마지막 메시지가 아니면 대기
      if (i < messages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    }

    // 완료 로깅
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'info',
      event: 'STREAM_COMPLETED',
      reqId,
      route: '/api/stream',
      method: 'GET',
      status: 200,
      totalMessages: messages.length
    }));

    res.end();

  } catch (error) {
    // 오류 로깅
    console.error(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'error',
      event: 'STREAM_ERROR',
      reqId,
      route: '/api/stream',
      method: 'GET',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error'
    }));

    res.end();
  }
}
