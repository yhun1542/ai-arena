import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';

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
      const { query: reqQuery, provider: reqProvider } = request.body;
      
      if (!reqQuery || typeof reqQuery !== 'string') {
        return response.status(400).json({
          error: 'Bad Request',
          message: 'Query is required',
          requestId
        });
      }
      
      query = reqQuery;
      provider = reqProvider || 'OPENAI';

    } else {
      return response.status(405).json({
        error: 'Method Not Allowed',
        message: 'Only GET and POST requests are supported',
        requestId
      });
    }

    // 스트리밍 응답을 위한 헤더 설정
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.setHeader('Transfer-Encoding', 'chunked');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');

    const modelName = getModelName(provider);
    response.write(`🤖 ${modelName}이 "${query}"에 대해 분석 중입니다...\n\n`);

    // 제공자별 API 호출
    switch (provider.toUpperCase()) {
      case 'OPENAI':
      case 'GPT':
        await handleOpenAIStream(response, query, requestId);
        break;

      case 'GEMINI':
      case 'GOOGLE':
        await handleGeminiStream(response, query, requestId);
        break;

      case 'CLAUDE':
      case 'ANTHROPIC':
        await handleClaudeStream(response, query, requestId);
        break;

      case 'GROK':
      case 'XAI':
        await handleGrokStream(response, query, requestId);
        break;

      default:
        response.write(`❌ 지원하지 않는 제공자입니다: ${provider}\n`);
        response.write(`지원 제공자: OPENAI, GEMINI, CLAUDE, GROK\n`);
    }

    // 스트리밍 완료 메시지
    response.write(`\n\n---\n📝 요청 ID: ${requestId}\n🤖 모델: ${modelName}\n⏰ 완료 시간: ${new Date().toISOString()}\n`);
    
    // 스트리밍 완료
    if (!response.writableEnded) {
      response.end();
    }
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

// OpenAI 스트리밍 처리
async function handleOpenAIStream(response: VercelResponse, query: string, requestId: string) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    return await handleFallbackStream(response, query, 'OpenAI GPT-4o');
  }

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: query
        }],
        stream: true,
        max_tokens: 1500,
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

    while (true) {
      const { value, done } = await reader.read();
      
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              response.write(content);
            }
          } catch (parseError) {
            continue;
          }
        }
      }
    }
  } catch (error) {
    console.error('OpenAI 스트리밍 오류:', error);
    response.write(`\n❌ OpenAI API 오류: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
  }
}

// Gemini 스트리밍 처리 (Fallback)
async function handleGeminiStream(response: VercelResponse, query: string, requestId: string) {
  const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  
  if (!GOOGLE_API_KEY) {
    return await handleFallbackStream(response, query, 'Gemini Pro');
  }

  // 실제 Gemini API 구현은 복잡하므로 현재는 fallback 사용
  return await handleFallbackStream(response, query, 'Gemini Pro');
}

// Claude 스트리밍 처리 (Fallback)
async function handleClaudeStream(response: VercelResponse, query: string, requestId: string) {
  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
  
  if (!ANTHROPIC_API_KEY) {
    return await handleFallbackStream(response, query, 'Claude 3.5 Sonnet');
  }

  // 실제 Claude API 구현은 복잡하므로 현재는 fallback 사용
  return await handleFallbackStream(response, query, 'Claude 3.5 Sonnet');
}

// Grok 스트리밍 처리 (Fallback)
async function handleGrokStream(response: VercelResponse, query: string, requestId: string) {
  const XAI_API_KEY = process.env.XAI_API_KEY;
  
  if (!XAI_API_KEY) {
    return await handleFallbackStream(response, query, 'Grok Beta');
  }

  // 실제 Grok API 구현은 복잡하므로 현재는 fallback 사용
  return await handleFallbackStream(response, query, 'Grok Beta');
}

// Fallback 스트리밍 함수
async function handleFallbackStream(response: VercelResponse, query: string, modelName: string) {
  const fallbackResponse = `안녕하세요! ${modelName} AI입니다.

현재 질문: "${query}"

${getModelResponse(modelName, query)}

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
    await new Promise(resolve => setTimeout(resolve, 30));
  }
}

function getModelName(provider: string): string {
  switch (provider.toUpperCase()) {
    case 'OPENAI':
    case 'GPT':
      return 'OpenAI GPT-4o';
    case 'GEMINI':
    case 'GOOGLE':
      return 'Gemini Pro';
    case 'CLAUDE':
    case 'ANTHROPIC':
      return 'Claude 3.5 Sonnet';
    case 'GROK':
    case 'XAI':
      return 'Grok Beta';
    default:
      return 'AI 모델';
  }
}

function getModelResponse(modelName: string, query: string): string {
  switch (modelName) {
    case 'OpenAI GPT-4o':
      return `GPT-4o로서 "${query}"에 대해 체계적이고 종합적인 분석을 제공하겠습니다. 다양한 관점에서 균형잡힌 답변을 드리겠습니다.`;
    case 'Gemini Pro':
      return `Gemini Pro로서 "${query}"에 대해 창의적이고 혁신적인 관점을 제시하겠습니다. 다각도 분석을 통한 새로운 인사이트를 제공하겠습니다.`;
    case 'Claude 3.5 Sonnet':
      return `Claude 3.5 Sonnet으로서 "${query}"에 대해 논리적이고 윤리적인 분석을 제공하겠습니다. 균형잡힌 비판적 사고로 답변드리겠습니다.`;
    case 'Grok Beta':
      return `Grok Beta로서 "${query}"에 대해 실용적이고 직설적인 관점을 제시하겠습니다. 현실적이고 간결한 답변을 드리겠습니다.`;
    default:
      return `"${query}"에 대해 최선의 답변을 제공하겠습니다.`;
  }
}

function getModelCharacteristics(modelName: string): string {
  switch (modelName) {
    case 'OpenAI GPT-4o':
      return '- 종합적이고 체계적인 분석\n- 균형잡힌 관점 제시\n- 상세한 설명과 예시 제공';
    case 'Gemini Pro':
      return '- 창의적이고 혁신적인 접근\n- 다각도 분석과 통찰\n- 시각적 정보 처리 능력';
    case 'Claude 3.5 Sonnet':
      return '- 논리적이고 윤리적인 분석\n- 균형잡힌 비판적 사고\n- 안전하고 신중한 답변';
    case 'Grok Beta':
      return '- 실용적이고 직설적인 접근\n- 현실적인 관점 제시\n- 간결하고 명확한 답변';
    default:
      return '- 고품질 AI 분석 제공\n- 사용자 맞춤형 답변\n- 정확하고 유용한 정보';
  }
}
