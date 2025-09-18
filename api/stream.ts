// api/stream.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // 상관관계ID 추가
  const requestId = uuidv4();
  
  try {
    // CORS 헤더 설정
    response.setHeader('x-request-id', requestId);
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // OPTIONS 요청 처리 (CORS preflight)
    if (request.method === 'OPTIONS') {
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        level: 'info',
        event: 'CORS_PREFLIGHT',
        reqId: requestId,
        route: '/api/stream',
        method: 'OPTIONS',
        status: 200
      }));
      return response.status(200).end();
    }

    // GET 메서드만 허용
    if (request.method !== 'GET') {
      console.log(JSON.stringify({
        ts: new Date().toISOString(),
        level: 'warn',
        event: 'METHOD_NOT_ALLOWED',
        reqId: requestId,
        route: '/api/stream',
        method: request.method,
        status: 405
      }));
      response.setHeader('Allow', 'GET');
      return response.status(405).json({ error: 'Method not allowed' });
    }

    // 스트리밍 헤더 설정
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.setHeader('Connection', 'keep-alive');

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

    // 스트리밍 데이터 준비
    const streamParts = [
      'AI Arena 스트리밍 데모를 시작합니다...\n\n',
      '🔄 연결 설정 중...\n',
      '✅ 연결이 성공적으로 설정되었습니다.\n\n',
      '📡 데이터 스트리밍 시작...\n',
      '📊 청크 1/5: 초기화 완료\n',
      '📊 청크 2/5: 데이터 처리 중\n',
      '📊 청크 3/5: 응답 생성 중\n',
      '📊 청크 4/5: 최종 검증 중\n',
      '📊 청크 5/5: 완료 준비 중\n\n',
      '🎉 스트리밍이 성공적으로 완료되었습니다!\n',
      '📝 요청 ID: ' + requestId + '\n',
      '⏰ 완료 시간: ' + new Date().toISOString() + '\n'
    ];

    // 스트리밍 실행
    let chunkCount = 0;
    for (const part of streamParts) {
      try {
        // 연결이 여전히 활성화되어 있는지 확인
        if (response.destroyed || response.writableEnded) {
          console.log(JSON.stringify({
            ts: new Date().toISOString(),
            level: 'warn',
            event: 'STREAM_INTERRUPTED',
            reqId: requestId,
            route: '/api/stream',
            chunkCount: chunkCount,
            totalChunks: streamParts.length
          }));
          break;
        }

        response.write(part);
        chunkCount++;
        
        // 각 청크 사이에 지연 추가 (실제 스트리밍 시뮬레이션)
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (writeError) {
        console.error(JSON.stringify({
          ts: new Date().toISOString(),
          level: 'error',
          event: 'STREAM_WRITE_ERROR',
          reqId: requestId,
          route: '/api/stream',
          chunkCount: chunkCount,
          error: writeError instanceof Error ? writeError.message : 'Write error'
        }));
        break;
      }
    }
    
    // 스트리밍 완료 로깅
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'info',
      event: 'STREAM_COMPLETED',
      reqId: requestId,
      route: '/api/stream',
      method: 'GET',
      status: 200,
      totalChunks: chunkCount,
      expectedChunks: streamParts.length
    }));
    
    // 스트리밍 종료
    if (!response.writableEnded) {
      response.end();
    }
    
  } catch (error: any) {
    // 예상치 못한 오류 처리
    console.error(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'error',
      event: 'STREAM_UNEXPECTED_ERROR',
      reqId: requestId,
      route: '/api/stream',
      method: request.method,
      status: 500,
      error: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace'
    }));
    
    // 오류 응답 (스트리밍이 시작되지 않은 경우에만)
    if (!response.headersSent) {
      response.status(500).json({ 
        error: 'Internal server error',
        requestId: requestId
      });
    } else {
      // 스트리밍 중 오류 발생 시 스트림 종료
      if (!response.writableEnded) {
        response.write('\n\n❌ 스트리밍 중 오류가 발생했습니다.\n');
        response.end();
      }
    }
  }
}
