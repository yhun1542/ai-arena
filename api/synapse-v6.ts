import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // CORS 헤더 설정
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only POST requests are supported'
    });
  }

  try {
    const { query, useAdvanced } = request.body;

    if (!query) {
      return response.status(400).json({
        error: 'Bad Request',
        message: 'Query parameter is required'
      });
    }

    // 간단한 테스트 응답
    return response.status(200).json({
      success: true,
      message: 'Synapse v6 API is working!',
      data: {
        query: query,
        useAdvanced: useAdvanced,
        timestamp: new Date().toISOString(),
        version: 'v6'
      }
    });

  } catch (error) {
    console.error('Synapse v6 API Error:', error);
    return response.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
}
