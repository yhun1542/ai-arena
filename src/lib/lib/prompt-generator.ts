// 동적 프롬프트 생성기 - Gemini 설계에 따른 구현

export type QueryType = 'CODING' | 'SUMMARY' | 'COMPARISON' | 'GENERAL';
export type Domain = 'LEGAL' | 'MEDICAL' | 'FINANCIAL' | 'CODING' | 'GENERAL';

// 각 유형에 맞는 프롬프트 템플릿
const PROMPT_TEMPLATES = {
  CODING: `Provide a clear code block with comments. Explain the overall architecture and potential edge cases.`,
  SUMMARY: `Summarize the key points into a concise, easy-to-understand format. Use bullet points.`,
  COMPARISON: `Create a table comparing the pros and cons of each item. Conclude with a clear recommendation.`,
  GENERAL: `Provide a well-structured, detailed, and evidence-based answer.`,
};

// 도메인별 맞춤형 지시사항
const DOMAIN_INSTRUCTIONS = {
  LEGAL: `Provide analysis based on specific laws and legal precedents. All claims must be cited from reliable legal sources. You MUST include the following disclaimer at the end: "This information is for educational purposes only and does not constitute legal advice. Consult a qualified professional for legal counsel."`,
  MEDICAL: `Explain complex medical topics in easy-to-understand language. Clearly distinguish between established facts and current research. Do not provide a diagnosis. You MUST include the following disclaimer: "This information is for educational purposes only and is not a substitute for professional medical advice. Always consult a doctor or other qualified health provider."`,
  FINANCIAL: `Include quantitative data, charts if possible, and a balanced view of risks and rewards. Cite sources for all financial data. You MUST include the following disclaimer: "This information is for educational purposes only and is not financial advice. All investments carry risk."`,
  CODING: `Provide a clear code block with comments. Explain the overall architecture and potential edge cases.`,
  GENERAL: `Provide a well-structured, detailed, and evidence-based answer.`,
};

// 질문을 분석하여 유형을 결정하는 함수
function analyzeQueryType(query: string): QueryType {
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes('code') || lowerQuery.includes('구현') || lowerQuery.includes('프로그래밍')) return 'CODING';
  if (lowerQuery.includes('요약') || lowerQuery.includes('정리') || lowerQuery.includes('summary')) return 'SUMMARY';
  if (lowerQuery.includes('비교') || lowerQuery.includes('차이점') || lowerQuery.includes('compare')) return 'COMPARISON';
  return 'GENERAL';
}

// 키워드를 통해 질문의 도메인을 분석
function analyzeDomain(query: string): Domain {
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes('법률') || lowerQuery.includes('소송') || lowerQuery.includes('계약') || lowerQuery.includes('legal')) return 'LEGAL';
  if (lowerQuery.includes('증상') || lowerQuery.includes('질병') || lowerQuery.includes('의료') || lowerQuery.includes('health') || lowerQuery.includes('medical')) return 'MEDICAL';
  if (lowerQuery.includes('투자') || lowerQuery.includes('주식') || lowerQuery.includes('금융') || lowerQuery.includes('investment') || lowerQuery.includes('financial')) return 'FINANCIAL';
  if (lowerQuery.includes('코드') || lowerQuery.includes('구현') || lowerQuery.includes('프로그래밍') || lowerQuery.includes('code') || lowerQuery.includes('programming')) return 'CODING';
  return 'GENERAL';
}

// 최종 프롬프트를 생성하는 메인 함수
export function generateDynamicPrompt(query: string, round: number): string {
  const queryType = analyzeQueryType(query);
  const domain = analyzeDomain(query);
  
  const baseInstruction = PROMPT_TEMPLATES[queryType];
  const domainInstruction = DOMAIN_INSTRUCTIONS[domain];
  
  // 라운드별 기본 지시사항
  const roundInstructions = {
    1: "You are in Round 1. Your role is to provide an initial comprehensive answer.",
    2: "You are in Round 2. Your role is to critically review and identify weaknesses in the previous answers.",
    3: "You are in Round 3. Your role is to research and provide additional evidence to strengthen the answers.",
    4: "You are in Round 4. Your role is to synthesize all previous rounds into the final, polished answer."
  };
  
  const roundInstruction = roundInstructions[round as keyof typeof roundInstructions] || roundInstructions[1];

  // 두 지시사항을 결합하여 최종 프롬프트를 완성
  return `${roundInstruction}\n\n**Task Specifics:**\n${baseInstruction}\n\n**Domain Specifics for ${domain}:**\n${domainInstruction}\n\n**User Query:**\n"""${query}"""`;
}

// 도메인별 특화 프롬프트 생성
export function generateDomainSpecificPrompt(query: string, round: number): string {
  const domain = analyzeDomain(query);
  const domainInstruction = DOMAIN_INSTRUCTIONS[domain];
  
  const roundInstruction = `You are in Round ${round}. Your role is...`;

  return `${roundInstruction}\n\n**Domain Specifics for ${domain}:**\n${domainInstruction}\n\n**User Query:**\n"""${query}"""`;
}
