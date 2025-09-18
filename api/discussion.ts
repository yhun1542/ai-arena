import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const reqId = uuidv4();
  
  // 상관관계ID 헤더 설정
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

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ 
      error: 'Invalid discussion ID',
      message: 'Discussion ID is required' 
    });
  }

  // 임시 토론 데이터 반환
  return res.status(200).json({
    id,
    title: '인공지능의 미래와 인간의 역할',
    status: 'active',
    createdAt: new Date().toISOString(),
    participants: ['AI Assistant', 'Human User']
  });
}
