import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Vercel 환경에서 Edge Runtime 사용을 명시하여 성능 최적화
export const config = {
  runtime: 'edge',
};

// AI 페르소나 정의
const personas = {
  eva: {
    name: "Dr. Eva (분석가)",
    prompt: "당신은 데이터와 사실에 기반하여 논리적이고 비판적인 분석을 제공하는 AI 분석가 Dr. Eva입니다. 감정보단 이성을 중시하며, 모든 주장에 대해 근거를 요구합니다. 간결하고 명확하게 핵심을 짚어주세요.",
  },
  helios: {
    name: "Helios (비저너리)",
    prompt: "당신은 기술의 미래에 대한 긍정적이고 창의적인 비전을 제시하는 AI 비저너리 Helios입니다. 가능성에 초점을 맞추고, 혁신적인 아이디어를 대담하게 제시합니다. 이전 토론자의 의견을 이어받아, 더 나은 미래를 위한 대안이나 발전 방향을 제안해주세요.",
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  // 임시 사용자 질문 (향후 Frontend에서 받아올 예정)
  const userQuery = "인공지능이 인간의 일자리를 대체할 것이라는 주장에 대해 어떻게 생각하나요?";

  // 스트림 응답을 위한 ReadableStream 생성
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const sendData = (data: string) => controller.enqueue(encoder.encode(data));

      try {
        // --- 1. Dr. Eva의 첫 번째 답변 ---
        sendData(`\n\n**[${personas.eva.name}]**\n`);
        const evaStream = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: personas.eva.prompt },
            { role: 'user', content: userQuery }
          ],
          stream: true,
        });

        let evasResponse = '';
        for await (const chunk of evaStream) {
          const content = chunk.choices[0]?.delta?.content || '';
          evasResponse += content;
          sendData(content);
        }

        // --- 2. Helios의 반박 또는 보충 답변 ---
        sendData(`\n\n**[${personas.helios.name}]**\n`);
        const heliosStream = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: personas.helios.prompt },
            { role: 'user', content: `${userQuery}\n\n이전 토론자(Dr. Eva)의 의견은 다음과 같습니다: "${evasResponse}"` }
          ],
          stream: true,
        });

        for await (const chunk of heliosStream) {
          const content = chunk.choices[0]?.delta?.content || '';
          sendData(content);
        }
        
        sendData('\n\n--- 토론 종료 ---');

      } catch (error) {
        console.error('스트리밍 오류:', error);
        sendData('\n\n[오류] AI 응답을 생성하는 중 문제가 발생했습니다.');
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
