// api/stream.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';
import { setTimeout } from 'timers/promises'; // Use promise-based setTimeout for async/await

export default async function handler(
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

  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');

  // 스트리밍 시작 로깅
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    level: 'info',
    event: 'STREAM_STARTED',
    reqId: requestId,
    route: '/api/stream',
    method: 'GET',
    status: 200
  }));

  const parts = [
    'AI Arena streaming demo 시작\n',
    '청크 1: 준비…\n',
    '청크 2: 연결 유지…\n',
    '청크 3: 토큰 생성…\n',
    '청크 4: 안정화…\n',
    '완료.\n'
  ];

  try {
    for (const part of parts) {
      response.write(part);
      await setTimeout(350); // Await the promise-based timeout
    }
    
    // 완료 로깅
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'info',
      event: 'STREAM_COMPLETED',
      reqId: requestId,
      route: '/api/stream',
      method: 'GET',
      status: 200,
      totalChunks: parts.length
    }));
    
    response.end();
  } catch (error) {
    // 오류 로깅
    console.error(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'error',
      event: 'STREAM_ERROR',
      reqId: requestId,
      route: '/api/stream',
      method: 'GET',
      status: 500,
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
    
    console.error("Stream failed:", error);
    // Ensure the stream is properly closed on error
    if (!response.writableEnded) {
      response.end();
    }
  }
}
