import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // 상관관계ID 추가
  const requestId = uuidv4();
  response.setHeader('x-request-id', requestId);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS 요청 처리 (CORS preflight)
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    console.log(`🚀 Discussion API 요청: ${request.method}`, {
      requestId,
      query: request.query,
      timestamp: new Date().toISOString()
    });

    if (request.method === 'GET') {
      // GET 요청 - 토론 데이터 조회
      const { id } = request.query;
      
      if (!id || typeof id !== 'string') {
        return response.status(400).json({ 
          error: 'Bad Request',
          message: 'Discussion ID is required',
          requestId
        });
      }

      // 토론 데이터 조회 (모의 데이터)
      const discussionData = {
        id: id,
        title: `AI 협업 토론: ${id}`,
        participants: [
          { name: 'GPT-4o', role: 'analyst', color: '#10B981', icon: '🤖' },
          { name: 'Claude', role: 'critic', color: '#8B5CF6', icon: '🧠' },
          { name: 'Gemini', role: 'synthesizer', color: '#3B82F6', icon: '💎' },
          { name: 'Grok', role: 'pragmatist', color: '#F59E0B', icon: '⚡' }
        ],
        messages: [
          {
            id: uuidv4(),
            participant: 'GPT-4o',
            content: '이 주제에 대한 체계적이고 종합적인 분석을 시작하겠습니다.',
            timestamp: new Date().toISOString(),
            type: 'analysis'
          },
          {
            id: uuidv4(),
            participant: 'Claude',
            content: '논리적 구조와 윤리적 측면을 검토하여 균형잡힌 관점을 제공하겠습니다.',
            timestamp: new Date().toISOString(),
            type: 'critique'
          },
          {
            id: uuidv4(),
            participant: 'Gemini',
            content: '창의적이고 혁신적인 접근법으로 새로운 관점을 제시하겠습니다.',
            timestamp: new Date().toISOString(),
            type: 'innovation'
          },
          {
            id: uuidv4(),
            participant: 'Grok',
            content: '실용적이고 현실적인 관점에서 직설적인 분석을 제공하겠습니다.',
            timestamp: new Date().toISOString(),
            type: 'practical'
          }
        ],
        status: 'active',
        createdAt: new Date().toISOString(),
        requestId
      };

      console.log(`✅ Discussion 데이터 반환: ${id}`);
      return response.status(200).json({
        success: true,
        data: discussionData,
        requestId
      });

    } else if (request.method === 'POST') {
      // POST 요청 - 새로운 토론 생성
      const { query, topic } = request.body;
      
      if (!query || typeof query !== 'string') {
        return response.status(400).json({
          error: 'Bad Request',
          message: 'Query is required for creating discussion',
          requestId
        });
      }

      const newDiscussionId = uuidv4();
      const discussionData = {
        id: newDiscussionId,
        query: query,
        topic: topic || 'General Discussion',
        status: 'created',
        createdAt: new Date().toISOString(),
        requestId
      };

      console.log(`✅ Discussion 생성: ${newDiscussionId}`);
      return response.status(201).json({
        success: true,
        data: discussionData,
        requestId
      });

    } else {
      // 지원하지 않는 HTTP 메서드
      response.setHeader('Allow', 'GET, POST, OPTIONS');
      return response.status(405).json({
        error: 'Method Not Allowed',
        message: 'Only GET and POST methods are supported',
        requestId
      });
    }

  } catch (error) {
    console.error('❌ Discussion API 오류:', error);
    
    // 중요: 오류 발생 시에도 반드시 응답을 반환
    return response.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      requestId,
      timestamp: new Date().toISOString()
    });
  }
}
