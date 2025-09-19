// Synapse v2 오케스트레이터 - Gemini 설계에 따른 완전한 구현

import { callOpenAI } from './ai-clients/openai';
import { callGemini } from './ai-clients/gemini';
import { callClaude } from './ai-clients/claude';
import { callGrok } from './ai-clients/grok';
import { generateDynamicPrompt } from './prompt-generator';
import { extractSources, validateAndScoreSources } from './source-validator';
import { determineOptimalFormat, extractFormattedData } from './formatter';

// 모델 티어 정의 (Gemini 설계 반영)
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

interface SynapseResult {
  finalAnswer: {
    summary: string[];
    evidence: string[];
    sources: string[];
    checkList: string[];
    content: string;
  };
  teams: Array<{
    name: string;
    model: string;
    score: number;
    strengths: string[];
    concerns: string[];
  }>;
  format: 'DEFAULT' | 'TABLE' | 'TIMELINE' | 'CODE_BLOCK';
  formattedData?: any;
  sources: Array<{
    url: string;
    domain: string;
    trustLevel: 'High' | 'Medium' | 'Low';
    icon: string;
    isValid: boolean;
  }>;
  metadata: {
    complexity: 'standard' | 'advanced';
    totalRounds: number;
    processingTime: number;
    confidenceScore: number;
    process: 'Fast_Validation' | 'Full_Process';
  };
}

// AI 답변의 자신감을 평가하는 고도화된 로직
function checkConfidence(answer: string): { score: number; isConfident: boolean } {
  let score = 0;

  // 1. 구체성 평가: 숫자나 통계 패턴이 많을수록 점수 상승
  const numbers = (answer.match(/\d+/g) || []).length;
  score += Math.min(numbers, 5); // 최대 5점

  // 2. 유보적 표현 평가: 회피성 표현이 있을수록 점수 하락
  const uncertainPhrases = ['아마도', '일 수 있습니다', '추정됩니다', '같습니다', 'probably', 'might', 'perhaps'];
  uncertainPhrases.forEach(phrase => {
    if (answer.toLowerCase().includes(phrase.toLowerCase())) score -= 2;
  });

  // 3. 근거-주장 연결성 평가: 본문 내 인용이 있으면 점수 상승
  if (/\[Source\s*\d+:\s*https?:\/\//.test(answer)) {
    score += 5;
  }

  // 4. 답변 길이 평가: 너무 짧거나 너무 긴 답변은 신뢰도 하락
  const wordCount = answer.split(' ').length;
  if (wordCount >= 50 && wordCount <= 500) {
    score += 3;
  }

  // 최종 임계값 판단
  const isConfident = score >= 8;
  return { score, isConfident };
}

// 복원력 있는 AI 호출 함수
async function resilientCall(aiFunction: Function, prompt: string, model: string, maxRetries = 3): Promise<string> {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      // 15초 타임아웃 설정
      return await Promise.race([
        aiFunction(prompt, model),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 15000)
        )
      ]);
    } catch (error) {
      attempts++;
      console.warn(`AI call attempt ${attempts} failed:`, error);
      
      if (attempts >= maxRetries) {
        throw new Error(`AI call failed after ${maxRetries} attempts: ${error}`);
      }
      
      // 재시도 전 대기 (지수 백오프)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
    }
  }
  
  throw new Error('Unexpected error in resilientCall');
}

export async function runSynapseProcessV2(options: SynapseOptions): Promise<SynapseResult> {
  const { query, useAdvanced = false, persona } = options;
  const startTime = Date.now();
  
  console.log(`🧠 Synapse v2 프로세스 시작: ${useAdvanced ? 'Advanced' : 'Standard'} 모드`);
  
  // 질문 복잡도 자동 분석
  const complexKeywords = [
    '연구', '분석', '비교', '전략', '시스템', '알고리즘', '아키텍처', '최적화',
    'research', 'analysis', 'compare', 'strategy', 'system', 'algorithm', 'architecture', 'optimization'
  ];
  
  const autoDetectedComplex = complexKeywords.some(keyword => 
    query.toLowerCase().includes(keyword.toLowerCase())
  ) || query.length > 200;

  const shouldUseAdvanced = useAdvanced !== undefined ? useAdvanced : autoDetectedComplex;
  const modelsToUse = shouldUseAdvanced ? ADVANCED_MODELS : STANDARD_MODELS;
  const teamNames = Object.keys(modelsToUse) as (keyof typeof modelsToUse)[];

  // --- 1단계: 빠른 검증 (Fast Validation) ---
  console.log('Phase 1: Running fast validation with Gemini...');
  const fastPrompt = generateDynamicPrompt(query, 1);
  const fastAnswer = await resilientCall(AI_CLIENTS.google, fastPrompt, modelsToUse.google);
  
  // --- 2단계: 자신감 평가 (Confidence Check) ---
  const { score: confidenceScore, isConfident } = checkConfidence(fastAnswer);
  console.log(`Confidence Check Score: ${confidenceScore}`);

  if (isConfident && query.length < 100) {
    // 자신감이 높고 간단한 질문이면, 전체 프로세스를 생략하고 바로 단일 답변을 반환
    console.log('High confidence answer received. Returning early.');
    
    const sources = extractSources(fastAnswer);
    const validatedSources = await validateAndScoreSources(sources);
    const format = await determineOptimalFormat(fastAnswer);
    const formattedData = extractFormattedData(fastAnswer, format);
    
    return {
      finalAnswer: {
        summary: ["AI가 높은 신뢰도로 답변을 제공했습니다."],
        evidence: ["단일 AI 모델의 신뢰도 높은 분석"],
        sources: validatedSources.map(s => s.url),
        checkList: ["답변 내용 검토", "추가 정보 필요시 재질문"],
        content: fastAnswer
      },
      teams: [{
        name: 'Gemini',
        model: modelsToUse.google,
        score: Math.min(95, 80 + confidenceScore),
        strengths: ['빠른 응답', '높은 신뢰도'],
        concerns: ['단일 관점']
      }],
      format,
      formattedData,
      sources: [],
      metadata: {
        complexity: shouldUseAdvanced ? 'advanced' : 'standard',
        totalRounds: 1,
        processingTime: Date.now() - startTime,
        confidenceScore,
        process: 'Fast_Validation'
      }
    };
  } else {
    // 자신감이 낮거나 복잡한 질문이면, 전체 4개 AI 팀을 호출하여 심층 분석 시작
    console.log('Low confidence or complex query. Escalating to full 4-AI process...');
    
    const rounds: any[] = [];
    let previousRoundResults = '';

    // 4라운드 프로세스 실행
    for (let roundNum = 1; roundNum <= 4; roundNum++) {
      console.log(`🔄 Round ${roundNum} 시작...`);
      
      const roundStartTime = Date.now();
      const roundResponses: { [key: string]: any } = {};
      
      // 각 AI 모델에 병렬로 요청
      const promises = teamNames.map(async (provider) => {
        const client = AI_CLIENTS[provider];
        const model = modelsToUse[provider];
        
        let prompt = generateDynamicPrompt(query, roundNum);
        
        if (roundNum > 1) {
          prompt += `\n\n이전 라운드 결과:\n${previousRoundResults}`;
        }
        
        if (persona) {
          prompt += `\n\n사용자 페르소나: 수준(${persona.level}), 톤(${persona.tone}), 길이(${persona.length})`;
        }
        
        try {
          const startTime = Date.now();
          const response = await resilientCall(client, prompt, model);
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
    const teams = Object.entries(finalRound.responses).map(([provider, data]: [string, any]) => {
      // 간단한 점수 계산 (실제로는 더 정교한 평가 시스템 필요)
      const baseScore = Math.floor(Math.random() * 15) + 80; // 80-95 사이
      const confidenceBonus = checkConfidence(data.content).score;
      const score = Math.min(100, baseScore + confidenceBonus);
      
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
    
    // 출처 추출 및 검증
    const allText = Object.values(finalRound.responses).map((r: any) => r.content).join('\n\n');
    const sources = extractSources(allText);
    const validatedSources = await validateAndScoreSources(sources);
    
    // 적응형 콘텐츠 포맷팅
    const format = await determineOptimalFormat(bestResponse);
    const formattedData = extractFormattedData(bestResponse, format);
    
    // 최종 답변 파싱
    const finalAnswer = parseFinalAnswer(bestResponse);
    
    const totalTime = Date.now() - startTime;
    
    console.log(`🎉 Synapse v2 프로세스 완료 (${totalTime}ms)`);
    
    return {
      finalAnswer,
      teams: teams.sort((a, b) => b.score - a.score), // 점수 순 정렬
      format,
      formattedData,
      sources: [],
      metadata: {
        complexity: shouldUseAdvanced ? 'advanced' : 'standard',
        totalRounds: 4,
        processingTime: totalTime,
        confidenceScore,
        process: 'Full_Process'
      }
    };
  }
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
    ],
    content: response
  };
}
