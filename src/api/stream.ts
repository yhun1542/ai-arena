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

    // 사용자 질문 추출
    const userQuery = request.query.q as string;
    if (!userQuery) {
      return response.status(400).json({ error: '질문이 필요합니다.' });
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
      query: userQuery,
      status: 200
    }));

    // OpenAI API 호출
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      // OpenAI API 키가 없을 때 fallback 응답
      response.write(`🤖 AI Arena 팀이 "${userQuery}"에 대해 분석 중입니다...\n\n`);
      
      const fallbackResponse = `안녕하세요! AI Arena 팀입니다.

현재 질문: "${userQuery}"

죄송합니다. 현재 AI 서비스가 일시적으로 설정 중입니다. 
곧 완전한 AI 응답을 제공할 수 있도록 준비하고 있습니다.

임시로 다음과 같은 정보를 제공드립니다:

📊 질문 분석:
- 질문 유형: ${userQuery.includes('?') ? '질의형' : '서술형'}
- 질문 길이: ${userQuery.length}자
- 언어: 한국어

🔧 시스템 상태:
- 프론트엔드: ✅ 정상 작동
- 스트리밍: ✅ 정상 작동  
- AI 엔진: ⚙️ 설정 중

곧 완전한 AI 응답을 제공하겠습니다!`;

      // 스트리밍 시뮬레이션
      const chunks = fallbackResponse.split('\n');
      for (const chunk of chunks) {
        response.write(chunk + '\n');
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      response.write(`\n\n---\n📝 요청 ID: ${requestId}\n⏰ 완료 시간: ${new Date().toISOString()}\n`);
      
      if (!response.writableEnded) {
        response.end();
      }
      return;
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `당신은 AI Arena의 전문 AI 팀입니다. 사용자의 질문에 대해 정확하고 유용한 답변을 제공해주세요. 
            
답변 형식:
- 명확하고 구체적인 정보 제공
- 근거와 출처가 있는 경우 명시
- 한국어로 자연스럽게 답변
- 필요시 단계별 설명 제공

질문: "${userQuery}"`
          },
          {
            role: 'user',
            content: userQuery
          }
        ],
        stream: true,
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API 오류: ${openaiResponse.status}`);
    }

    if (!openaiResponse.body) {
      throw new Error('OpenAI 응답 스트림을 받을 수 없습니다.');
    }

    // OpenAI 스트림 처리
    const reader = openaiResponse.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    response.write(`🤖 AI Arena 팀이 "${userQuery}"에 대해 분석 중입니다...\n\n`);

    while (true) {
      const { value, done } = await reader.read();
      
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') {
            break;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              response.write(content);
            }
          } catch (parseError) {
            // JSON 파싱 오류는 무시 (일부 라인은 파싱되지 않을 수 있음)
            continue;
          }
        }
      }
    }

    response.write(`\n\n---\n📝 요청 ID: ${requestId}\n⏰ 완료 시간: ${new Date().toISOString()}\n`);
    
    // 스트리밍 완료 로깅
    console.log(JSON.stringify({
      ts: new Date().toISOString(),
      level: 'info',
      event: 'STREAM_COMPLETED',
      reqId: requestId,
      route: '/api/stream',
      method: 'GET',
      query: userQuery,
      status: 200
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
        response.write(`\n\n❌ 스트리밍 중 오류가 발생했습니다: ${error?.message || 'Unknown error'}\n`);
        response.end();
      }
    }
  }
}
