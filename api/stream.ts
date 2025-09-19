import type { VercelRequest, VercelResponse } from '@vercel/node';
import { streamText, CoreMessage } from 'ai';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { v4 as uuidv4 } from 'uuid';

// Grok (xAI) 설정: OpenAI와 호환되므로 baseURL을 xAI 엔드포인트로 지정
const grok = createOpenAI({
  apiKey: process.env.XAI_API_KEY || '',
  baseURL: 'https://api.x.ai/v1',
});

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  const requestId = uuidv4();
  
  // CORS 헤더 설정
  response.setHeader('x-request-id', requestId);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    console.log('🚀 Stream API 요청 수신:', {
      method: request.method,
      requestId,
      timestamp: new Date().toISOString()
    });

    let query: string;
    let provider: string = 'OPENAI';

    if (request.method === 'GET') {
      // GET 요청 - 쿼리 파라미터에서 데이터 추출
      query = request.query.q as string;
      provider = (request.query.provider as string) || 'OPENAI';
      
      if (!query) {
        return response.status(400).json({
          error: 'Bad Request',
          message: 'Query parameter "q" is required',
          requestId
        });
      }

    } else if (request.method === 'POST') {
      // POST 요청 - 요청 본문에서 데이터 추출
      const { messages, provider: reqProvider, query: reqQuery } = request.body;
      
      if (reqQuery && typeof reqQuery === 'string') {
        query = reqQuery;
      } else if (messages && Array.isArray(messages) && messages.length > 0) {
        query = messages[messages.length - 1]?.content || '';
      } else {
        return response.status(400).json({
          error: 'Bad Request',
          message: 'Either "query" or "messages" is required',
          requestId
        });
      }
      
      provider = reqProvider || 'OPENAI';

    } else {
      return response.status(405).json({
        error: 'Method Not Allowed',
        message: 'Only GET and POST requests are supported',
        requestId
      });
    }

    // 메시지 형식으로 변환
    const formattedMessages: CoreMessage[] = [
      {
        role: 'user',
        content: query
      }
    ];

    // 제공자에 따른 모델 선택
    let model;
    let modelName = '';

    switch (provider.toUpperCase()) {
      case 'OPENAI':
      case 'GPT':
        if (!process.env.OPENAI_API_KEY) {
          return await handleFallbackStream(response, query, 'OpenAI', requestId);
        }
        model = openai('gpt-4o');
        modelName = 'GPT-4o';
        break;

      case 'GEMINI':
      case 'GOOGLE':
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
          return await handleFallbackStream(response, query, 'Gemini', requestId);
        }
        model = google('models/gemini-1.5-flash-latest');
        modelName = 'Gemini 1.5 Flash';
        break;

      case 'CLAUDE':
      case 'ANTHROPIC':
        if (!process.env.ANTHROPIC_API_KEY) {
          return await handleFallbackStream(response, query, 'Claude', requestId);
        }
        model = anthropic('claude-3-5-sonnet-20241022');
        modelName = 'Claude 3.5 Sonnet';
        break;

      case 'GROK':
      case 'XAI':
        if (!process.env.XAI_API_KEY) {
          return await handleFallbackStream(response, query, 'Grok', requestId);
        }
        model = grok('grok-beta');
        modelName = 'Grok Beta';
        break;

      default:
        return response.status(400).json({
          error: 'Invalid Provider',
          message: 'Supported providers: OPENAI, GEMINI, CLAUDE, GROK',
          supportedProviders: ['OPENAI', 'GEMINI', 'CLAUDE', 'GROK'],
          requestId
        });
    }

    console.log(`🤖 ${modelName} 모델로 스트리밍 시작`);

    // 스트리밍 응답을 위한 헤더 설정
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.setHeader('Transfer-Encoding', 'chunked');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');

    // 스트리밍 시작 메시지
    response.write(`🤖 ${modelName}이 "${query}"에 대해 분석 중입니다...\n\n`);

    // AI SDK의 streamText 함수를 사용하여 스트리밍 응답 생성
    const result = await streamText({
      model: model,
      messages: formattedMessages,
      temperature: 0.7,
      maxTokens: 1500,
    });

    // 스트리밍 응답 처리
    for await (const textPart of result.textStream) {
      response.write(textPart);
    }

    // 스트리밍 완료 메시지
    response.write(`\n\n---\n📝 요청 ID: ${requestId}\n🤖 모델: ${modelName}\n⏰ 완료 시간: ${new Date().toISOString()}\n`);
    
    // 스트리밍 완료
    response.end();
    console.log(`✅ ${modelName} 스트리밍 완료`);

  } catch (error) {
    console.error('❌ Stream API 오류:', error);

    // 이미 응답이 시작된 경우 처리
    if (response.headersSent) {
      if (!response.writableEnded) {
        response.write(`\n\n❌ 스트리밍 중 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
        response.end();
      }
      return;
    }

    // 에러 타입별 처리
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return response.status(503).json({
          error: 'Service Configuration Error',
          message: 'AI 서비스 설정에 문제가 있습니다.',
          code: 'CONFIG_ERROR',
          requestId
        });
      }

      if (error.message.includes('rate limit') || error.message.includes('quota')) {
        return response.status(429).json({
          error: 'Rate Limit Exceeded',
          message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
          code: 'RATE_LIMIT',
          requestId
        });
      }
    }

    // 일반적인 서버 오류
    return response.status(500).json({
      error: 'Internal Server Error',
      message: '스트리밍 처리 중 오류가 발생했습니다.',
      code: 'STREAM_ERROR',
      requestId,
      timestamp: new Date().toISOString()
    });
  }
}

// Fallback 스트리밍 함수 (API 키가 없을 때)
async function handleFallbackStream(
  response: VercelResponse,
  query: string,
  modelName: string,
  requestId: string
) {
  // 스트리밍 응답을 위한 헤더 설정
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.setHeader('Transfer-Encoding', 'chunked');
  response.setHeader('Cache-Control', 'no-cache');
  response.setHeader('Connection', 'keep-alive');

  response.write(`🤖 ${modelName} 시뮬레이션 모드로 "${query}"에 대해 분석 중입니다...\n\n`);

  const fallbackResponse = `안녕하세요! ${modelName} AI입니다.

현재 질문: "${query}"

죄송합니다. 현재 ${modelName} API 키가 설정되지 않아 시뮬레이션 모드로 동작합니다.

📊 질문 분석:
- 질문 유형: ${query.includes('?') ? '질의형' : '서술형'}
- 질문 길이: ${query.length}자
- 언어: ${/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(query) ? '한국어' : '영어'}

🔧 ${modelName} 특징:
${getModelCharacteristics(modelName)}

실제 API 키가 설정되면 더욱 정확하고 상세한 답변을 제공할 수 있습니다.`;

  // 스트리밍 시뮬레이션
  const chunks = fallbackResponse.split('\n');
  for (const chunk of chunks) {
    response.write(chunk + '\n');
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  response.write(`\n\n---\n📝 요청 ID: ${requestId}\n🤖 모델: ${modelName} (시뮬레이션)\n⏰ 완료 시간: ${new Date().toISOString()}\n`);
  response.end();
}

function getModelCharacteristics(modelName: string): string {
  switch (modelName) {
    case 'OpenAI':
      return '- 종합적이고 체계적인 분석\n- 균형잡힌 관점 제시\n- 상세한 설명과 예시 제공';
    case 'Gemini':
      return '- 창의적이고 혁신적인 접근\n- 다각도 분석과 통찰\n- 시각적 정보 처리 능력';
    case 'Claude':
      return '- 논리적이고 윤리적인 분석\n- 균형잡힌 비판적 사고\n- 안전하고 신중한 답변';
    case 'Grok':
      return '- 실용적이고 직설적인 접근\n- 현실적인 관점 제시\n- 간결하고 명확한 답변';
    default:
      return '- 고품질 AI 분석 제공\n- 사용자 맞춤형 답변\n- 정확하고 유용한 정보';
  }
}
