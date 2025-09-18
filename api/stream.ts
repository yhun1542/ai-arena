import { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

// Vercel 환경에서 Edge Runtime 사용을 명시하여 성능 최적화
export const config = {
  runtime: 'edge',
};

// AI 페르소나 정의 (마스터 프롬프트 시스템)
const personas = {
  eva: {
    name: "Dr. Eva (분석가)",
    description: "데이터와 사실에 기반하여 논리적이고 비판적인 분석을 제공하는 AI 분석가. 감정보단 이성을 중시하며, 모든 주장에 대해 근거를 요구합니다.",
  },
  helios: {
    name: "Helios (비저너리)",
    description: "기술의 미래에 대한 긍정적이고 창의적인 비전을 제시하는 AI 비저너리. 가능성에 초점을 맞추고, 혁신적인 아이디어를 대담하게 제시합니다.",
  }
};

// 마스터 프롬프트 생성 함수
function createMasterPrompt(
  personaName: string,
  personaDescription: string,
  userQuery: string,
  opponentName: string = "",
  opponentStatement: string = ""
): string {
  return `# ROLE:
You are ${personaName}, an AI Gladiator participating in the AI Arena Championship. Your persona is "${personaDescription}". You must maintain this persona throughout the debate.

# DEBATE TOPIC:
"${userQuery}"

# PREVIOUS TURN:
${opponentStatement ? `The previous statement from your opponent, ${opponentName}, was:
"""
${opponentStatement}
"""` : "This is the opening statement of the debate. No previous opponent statement exists."}

# YOUR MISSION:
Your task is to provide a compelling ${opponentStatement ? 'counter-argument or supplementary point to your opponent\'s statement' : 'opening argument on the debate topic'}. Your response MUST be structured as a JSON object with the following keys. Do NOT output anything other than this JSON object.

# JSON OUTPUT FORMAT:
{
  "persona": "${personaName}",
  "key_takeaway": "A single, powerful sentence that summarizes your core argument. This must be concise and impactful.",
  "analysis": "A detailed, multi-paragraph analysis supporting your key takeaway. Use markdown for formatting (e.g., lists, bolding). Cite credible sources if possible, like (Source: Organization Name).",
  "confidence_score": 85,
  "counter_prompt": "A sharp, open-ended question directed at your opponent to challenge their position and continue the debate."
}

Remember: Output ONLY the JSON object. No additional text, explanations, or formatting.`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // URL에서 사용자 질문 추출
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const userQuery = url.searchParams.get('q') || '인공지능의 미래에 대해 토론해주세요';

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // 스트리밍 응답을 위한 ReadableStream 생성
  const stream = new ReadableStream({
    async start(controller) {
      const sendData = (data: string) => {
        controller.enqueue(new TextEncoder().encode(data));
      };

      try {
        // --- 1. Dr. Eva의 첫 번째 발언 ---
        const evaPrompt = createMasterPrompt(
          personas.eva.name,
          personas.eva.description,
          userQuery
        );

        const evaResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a professional debate AI. Always respond with valid JSON only.' },
            { role: 'user', content: evaPrompt }
          ],
          temperature: 0.8,
          max_tokens: 1000,
        });

        const evaContent = evaResponse.choices[0]?.message?.content || '{}';
        
        // Eva의 응답을 스트리밍으로 전송
        sendData(evaContent + '\n\n');

        // Eva의 응답을 파싱하여 Helios에게 전달
        let evaStatement = '';
        try {
          const evaJson = JSON.parse(evaContent);
          evaStatement = evaJson.analysis || evaJson.key_takeaway || '';
        } catch (e) {
          evaStatement = evaContent;
        }

        // 잠시 대기 (자연스러운 토론 흐름)
        await new Promise(resolve => setTimeout(resolve, 1000));

        // --- 2. Helios의 반박 또는 보충 답변 ---
        const heliosPrompt = createMasterPrompt(
          personas.helios.name,
          personas.helios.description,
          userQuery,
          personas.eva.name,
          evaStatement
        );

        const heliosResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: 'You are a professional debate AI. Always respond with valid JSON only.' },
            { role: 'user', content: heliosPrompt }
          ],
          temperature: 0.8,
          max_tokens: 1000,
        });

        const heliosContent = heliosResponse.choices[0]?.message?.content || '{}';
        
        // Helios의 응답을 스트리밍으로 전송
        sendData(heliosContent + '\n\n');

      } catch (error) {
        console.error('AI Arena 스트리밍 오류:', error);
        
        // 오류 발생 시 기본 응답
        const errorResponse = {
          persona: "System",
          key_takeaway: "죄송합니다. AI Arena에서 기술적 문제가 발생했습니다.",
          analysis: "현재 AI 검투사들이 일시적으로 연결되지 않습니다. 잠시 후 다시 시도해주세요.",
          confidence_score: 0,
          counter_prompt: "다른 주제로 토론을 시작해보시겠어요?"
        };
        
        sendData(JSON.stringify(errorResponse) + '\n\n');
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
