import type { VercelRequest, VercelResponse } from '@vercel/node';
import { v4 as uuidv4 } from 'uuid';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const reqId = uuidv4();
  
  // 상관관계ID 헤더 설정
  res.setHeader('x-request-id', reqId);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

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

  // 스트리밍 응답 시뮬레이션
  const messages = [
    'AI Arena 스트리밍 테스트 시작...',
    '토론 주제를 분석하고 있습니다.',
    '다양한 관점을 고려하여 응답을 준비 중입니다.',
    '스트리밍 응답이 완료되었습니다.'
  ];

  let messageIndex = 0;

  const sendMessage = () => {
    if (messageIndex < messages.length) {
      res.write(`${messages[messageIndex]}\n`);
      messageIndex++;
      setTimeout(sendMessage, 1000);
    } else {
      res.end();
    }
  };

  sendMessage();
}
