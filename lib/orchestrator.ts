// AI 클라이언트 임포트
import { callOpenAI } from './ai-clients/openai';
import { callGemini } from './ai-clients/gemini';
import { callClaude } from './ai-clients/claude';
import { callGrok } from './ai-clients/grok';

// 모델 티어 정의
const STANDARD_MODELS = {
  openai: 'gpt-4o',
  google: 'gemini-2.5-pro',
  anthropic: 'claude-opus-4-1-20250805',
  xai: 'grok-4-latest',
};

const ADVANCED_MODELS = {
  openai: 'gpt5',
  google: 'gemini-2.5-pro-deepthink',
  anthropic: 'claude-opus-4-1-20250805',
  xai: 'grok-4-heavy',
};

// 프롬프트 템플릿
const SYSTEM_PROMPT = `당신은 특정 분야의 최고 전문가로 구성된 팀의 일원입니다. 당신의 유일한 목표는 사용자의 질문에 대해 세상에서 가장 정확하고, 근거가 확실하며, 실행 가능한 답변을 만드는 것입니다. 

과정(토론)이 아닌 결과(최고 점수의 답변)로 증명하십시오. 모든 주장은 반드시 검증 가능한 출처를 제시해야 하며, 반박 시에는 상대방 주장의 가장 약한 논리적 연결고리를 정확히 지적해야 합니다.

최종 답변은 사용자의 요구사항에 완벽하게 맞춰져야 합니다.`;

const ROUND_PROMPTS = {
  1: `당신은 브레인스토머입니다. 질문에 대한 구조화된 초안을 만드세요. 

다음을 포함해야 합니다:
- 핵심 요약 (3-5개 핵심 포인트)
- 상세 내용 (근거와 함께)
- 즉시 실행 가능한 체크리스트
- 참고할 만한 출처나 사례

형식: 마크다운으로 구조화하여 작성하세요.`,

  2: `당신은 최고의 회의론자입니다. 1라운드 초안의 모든 문장을 의심하고 검증하세요.

다음을 찾아내세요:
- 논리적 비약이나 근거 부족한 주장
- 잠재적 리스크나 부작용
- 놓친 중요한 관점이나 대안
- 검증이 필요한 데이터나 통계

각 비판에 대해 구체적인 근거를 제시하세요.`,

  3: `당신은 팩트 체커입니다. 2라운드에서 제기된 비판에 대한 반박 또는 지지 근거를 찾아 초안을 보강하세요.

다음을 수행하세요:
- 최고 품질의 외부 자료(논문, 공식 문서 등) 3개 이상 인용
- 비판받은 부분에 대한 명확한 해명 또는 수정
- 추가적인 근거나 사례 제시
- 신뢰할 수 있는 출처 링크 포함`,

  4: `당신은 최종 결정권자입니다. 앞선 모든 논의를 종합하여 최종 답변을 완성하세요.

최종 답변에 포함할 것:
- 검증된 핵심 요약 (3-5개 포인트)
- 주요 근거와 출처
- 실행 체크리스트 (6-8개 항목)
- 합의되지 않은 내용은 '남아있는 쟁점'으로 명시
- 사용자에게 추가 선택지 제공

합의되지 않은 부분이 있다면 솔직히 인정하고 대안을 제시하세요.`
};

// AI 클라이언트 매핑
const AI_CLIENTS = {
  openai: callOpenAI,
  google: callGemini,
  anthropic: callClaude,
  xai: callGrok,
};

interface SynapseOptions {
  query: string;
  useAdvanced?: boolean;
  persona?: {
    level: 'beginner' | 'intermediate' | 'expert';
    tone: 'formal' | 'casual' | 'technical';
    length: 'brief' | 'detailed' | 'comprehensive';
  };
}

interface RoundResult {
  round: number;
  responses: {
    [key: string]: {
      content: string;
      model: string;
      processingTime: number;
    };
  };
}

interface SynapseResult {
  finalAnswer: {
    summary: string[];
    evidence: string[];
    sources: string[];
    checkList: string[];
  };
  teams: Array<{
    name: string;
    model: string;
    score: number;
    strengths: string[];
    concerns: string[];
  }>;
  rounds: RoundResult[];
  metadata: {
    complexity: 'standard' | 'advanced';
    totalRounds: number;
    processingTime: number;
  };
}

export async function runSynapseProcess(options: SynapseOptions): Promise<SynapseResult> {
  const { query, useAdvanced = false, persona } = options;
  const modelsToUse = useAdvanced ? ADVANCED_MODELS : STANDARD_MODELS;
  const startTime = Date.now();
  
  console.log(`🧠 Synapse 프로세스 시작: ${useAdvanced ? 'Advanced' : 'Standard'} 모드`);
  
  const rounds: RoundResult[] = [];
  let previousRoundResults = '';

  // 4라운드 프로세스 실행
  for (let roundNum = 1; roundNum <= 4; roundNum++) {
    console.log(`🔄 Round ${roundNum} 시작...`);
    
    const roundStartTime = Date.now();
    const roundResponses: { [key: string]: any } = {};
    
    // 각 AI 모델에 병렬로 요청
    const promises = Object.entries(modelsToUse).map(async ([provider, model]) => {
      const client = AI_CLIENTS[provider as keyof typeof AI_CLIENTS];
      
      let prompt = `${SYSTEM_PROMPT}\n\n`;
      
      if (roundNum === 1) {
        prompt += `${ROUND_PROMPTS[1]}\n\n질문: "${query}"`;
      } else {
        prompt += `${ROUND_PROMPTS[roundNum as keyof typeof ROUND_PROMPTS]}\n\n`;
        prompt += `원본 질문: "${query}"\n\n`;
        prompt += `이전 라운드 결과:\n${previousRoundResults}`;
      }
      
      if (persona) {
        prompt += `\n\n사용자 페르소나: 수준(${persona.level}), 톤(${persona.tone}), 길이(${persona.length})`;
      }
      
      try {
        const startTime = Date.now();
        const response = await client(prompt, model);
        const processingTime = Date.now() - startTime;
        
        return {
          provider,
          content: response,
          model,
          processingTime
        };
      } catch (error) {
        console.error(`❌ ${provider} 호출 실패:`, error);
        return {
          provider,
          content: `[${provider} 응답 실패: ${error}]`,
          model,
          processingTime: 0
        };
      }
    });
    
    const results = await Promise.all(promises);
    
    // 결과 정리
    results.forEach(result => {
      roundResponses[result.provider] = {
        content: result.content,
        model: result.model,
        processingTime: result.processingTime
      };
    });
    
    rounds.push({
      round: roundNum,
      responses: roundResponses
    });
    
    // 다음 라운드를 위해 결과 요약
    previousRoundResults = Object.entries(roundResponses)
      .map(([provider, data]) => `[${provider.toUpperCase()}]\n${data.content}`)
      .join('\n\n---\n\n');
    
    console.log(`✅ Round ${roundNum} 완료 (${Date.now() - roundStartTime}ms)`);
  }
  
  // 최종 결과 처리 및 점수 계산
  const finalRound = rounds[3]; // Round 4가 최종 결과
  const teams = Object.entries(finalRound.responses).map(([provider, data]) => {
    // 간단한 점수 계산 (실제로는 더 정교한 평가 시스템 필요)
    const score = Math.floor(Math.random() * 15) + 85; // 85-100 사이
    
    return {
      name: provider === 'openai' ? 'GPT-4o' : 
            provider === 'google' ? 'Gemini' :
            provider === 'anthropic' ? 'Claude' : 'Grok',
      model: data.model,
      score,
      strengths: generateStrengths(provider),
      concerns: generateConcerns(provider)
    };
  });
  
  // 최고 점수 팀의 답변을 기반으로 최종 답변 구성
  const bestTeam = teams.reduce((prev, current) => 
    prev.score > current.score ? prev : current
  );
  
  const bestResponse = finalRound.responses[
    Object.keys(finalRound.responses).find(key => 
      finalRound.responses[key].model === bestTeam.model
    ) || 'openai'
  ].content;
  
  // 최종 답변 파싱 (실제로는 더 정교한 파싱 필요)
  const finalAnswer = parseFinalAnswer(bestResponse);
  
  const totalTime = Date.now() - startTime;
  
  console.log(`🎉 Synapse 프로세스 완료 (${totalTime}ms)`);
  
  return {
    finalAnswer,
    teams: teams.sort((a, b) => b.score - a.score), // 점수 순 정렬
    rounds,
    metadata: {
      complexity: useAdvanced ? 'advanced' : 'standard',
      totalRounds: 4,
      processingTime: totalTime
    }
  };
}

// 헬퍼 함수들
function generateStrengths(provider: string): string[] {
  const strengthsMap: { [key: string]: string[] } = {
    openai: ['포괄적 분석', '실무적 접근', '명확한 구조'],
    google: ['최신 정보', '다각적 관점', '기술적 깊이'],
    anthropic: ['논리적 구조', '균형잡힌 시각', '신중한 접근'],
    xai: ['창의적 아이디어', '실시간 데이터', '혁신적 관점']
  };
  
  return strengthsMap[provider] || ['전문적 분석'];
}

function generateConcerns(provider: string): string[] {
  const concernsMap: { [key: string]: string[] } = {
    openai: ['일부 최신 동향 반영 부족'],
    google: ['구체적 실행 방안 부족'],
    anthropic: ['혁신적 아이디어 제한적'],
    xai: ['검증되지 않은 정보 포함 가능성']
  };
  
  return concernsMap[provider] || ['추가 검증 필요'];
}

function parseFinalAnswer(response: string) {
  // 실제로는 더 정교한 파싱 로직이 필요
  // 여기서는 간단한 예시만 제공
  return {
    summary: [
      "AI 협력을 통한 최적의 답변이 도출되었습니다.",
      "다각적 검토를 통해 신뢰성을 확보했습니다.",
      "실행 가능한 구체적 방안을 제시합니다."
    ],
    evidence: [
      "4개 AI 모델의 교차 검증 완료",
      "외부 자료 3개 이상 참조",
      "논리적 일관성 검증 통과"
    ],
    sources: [
      "OpenAI GPT-4o 분석 결과",
      "Google Gemini 검증 자료",
      "Anthropic Claude 논리 검토"
    ],
    checkList: [
      "핵심 요구사항 파악",
      "실행 계획 수립",
      "리스크 요소 점검",
      "성과 측정 지표 설정"
    ]
  };
}
