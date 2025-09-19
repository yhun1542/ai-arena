import type { VercelRequest, VercelResponse } from '@vercel/node';

// Node.js 런타임 강제 (벤더 SDK/HTTP 모듈 호환성)
export const runtime = 'nodejs';

// AI 모델 인터페이스 정의
interface AIModel {
  id: string;
  name: string;
  provider: string;
  apiEndpoint: string;
  model: string;
  specialty: string;
  icon: string;
  color: string;
  maxTokens: number;
  temperature: number;
}

// AI 응답 인터페이스
interface AIResponse {
  modelId: string;
  content: string;
  score: number;
  processingTime: number;
  confidence: number;
  strengths: string[];
  concerns: string[];
  metadata: {
    tokenCount: number;
    cost: number;
  };
}

// 오케스트레이션 설정
interface OrchestrationConfig {
  mode: 'parallel' | 'tournament' | 'debate' | 'consensus';
  selectedModels: string[];
  rounds: number;
  votingEnabled: boolean;
  timeoutMs: number;
  maxConcurrency: number;
}

// 확장된 AI 모델 정의
const AI_MODELS: AIModel[] = [
  // 기존 모델들
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    specialty: '종합 분석',
    icon: '🤖',
    color: '#10B981',
    maxTokens: 4096,
    temperature: 0.7
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
    model: 'gemini-pro',
    specialty: '창의적 사고',
    icon: '💎',
    color: '#3B82F6',
    maxTokens: 2048,
    temperature: 0.8
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    apiEndpoint: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-sonnet-20240229',
    specialty: '논리적 검증',
    icon: '🧠',
    color: '#8B5CF6',
    maxTokens: 4096,
    temperature: 0.6
  },
  {
    id: 'grok-beta',
    name: 'Grok',
    provider: 'xAI',
    apiEndpoint: 'https://api.x.ai/v1/chat/completions',
    model: 'grok-beta',
    specialty: '실용적 접근',
    icon: '⚡',
    color: '#F59E0B',
    maxTokens: 2048,
    temperature: 0.7
  },
  // 새로운 모델들
  {
    id: 'mistral-large',
    name: 'Mistral Large',
    provider: 'Mistral AI',
    apiEndpoint: 'https://api.mistral.ai/v1/chat/completions',
    model: 'mistral-large-latest',
    specialty: '효율성 전문가',
    icon: '🚀',
    color: '#EF4444',
    maxTokens: 4096,
    temperature: 0.7
  },
  {
    id: 'command-r-plus',
    name: 'Command R+',
    provider: 'Cohere',
    apiEndpoint: 'https://api.cohere.ai/v1/chat',
    model: 'command-r-plus',
    specialty: '검색 전문가',
    icon: '🔍',
    color: '#06B6D4',
    maxTokens: 4096,
    temperature: 0.7
  },
  {
    id: 'llama-3-1',
    name: 'Llama 3.1',
    provider: 'Meta',
    apiEndpoint: 'https://api.llama.com/v1/chat/completions',
    model: 'llama-3.1-70b-instruct',
    specialty: '코딩 전문가',
    icon: '🦙',
    color: '#8B5A2B',
    maxTokens: 4096,
    temperature: 0.5
  },
  {
    id: 'perplexity-online',
    name: 'Perplexity AI',
    provider: 'Perplexity',
    apiEndpoint: 'https://api.perplexity.ai/chat/completions',
    model: 'llama-3.1-sonar-large-128k-online',
    specialty: '팩트체킹 전문가',
    icon: '📊',
    color: '#7C3AED',
    maxTokens: 4096,
    temperature: 0.6
  }
];

// AI 모델별 API 호출 함수
async function callAIModel(model: AIModel, prompt: string, apiKeys: Record<string, string>): Promise<AIResponse> {
  const startTime = Date.now();
  
  try {
    let response: any;
    let content = '';
    
    switch (model.provider) {
      case 'OpenAI':
        response = await callOpenAI(model, prompt, apiKeys.OPENAI_API_KEY);
        content = response.choices[0]?.message?.content || '';
        break;
        
      case 'Google':
        response = await callGemini(model, prompt, apiKeys.GEMINI_API_KEY);
        content = response.candidates[0]?.content?.parts[0]?.text || '';
        break;
        
      case 'Anthropic':
        response = await callClaude(model, prompt, apiKeys.ANTHROPIC_API_KEY);
        content = response.content[0]?.text || '';
        break;
        
      case 'xAI':
        response = await callGrok(model, prompt, apiKeys.XAI_API_KEY);
        content = response.choices[0]?.message?.content || '';
        break;
        
      case 'Mistral AI':
        response = await callMistral(model, prompt, apiKeys.MISTRAL_API_KEY);
        content = response.choices[0]?.message?.content || '';
        break;
        
      case 'Cohere':
        response = await callCohere(model, prompt, apiKeys.COHERE_API_KEY);
        content = response.text || '';
        break;
        
      case 'Meta':
        response = await callLlama(model, prompt, apiKeys.LLAMA_API_KEY);
        content = response.choices[0]?.message?.content || '';
        break;
        
      case 'Perplexity':
        response = await callPerplexity(model, prompt, apiKeys.PERPLEXITY_API_KEY);
        content = response.choices[0]?.message?.content || '';
        break;
        
      default:
        throw new Error(`Unsupported provider: ${model.provider}`);
    }
    
    const processingTime = Date.now() - startTime;
    
    return {
      modelId: model.id,
      content,
      score: calculateScore(content, model.specialty),
      processingTime,
      confidence: calculateConfidence(content),
      strengths: extractStrengths(content, model.specialty),
      concerns: extractConcerns(content),
      metadata: {
        tokenCount: estimateTokenCount(content),
        cost: calculateCost(model, content)
      }
    };
    
  } catch (error) {
    console.error(`Error calling ${model.name}:`, error);
    
    return {
      modelId: model.id,
      content: `${model.name} 응답을 받을 수 없습니다: ${error instanceof Error ? error.message : 'Unknown error'}`,
      score: 0,
      processingTime: Date.now() - startTime,
      confidence: 0,
      strengths: [],
      concerns: ['API 호출 실패'],
      metadata: {
        tokenCount: 0,
        cost: 0
      }
    };
  }
}

// 개별 AI API 호출 함수들
async function callOpenAI(model: AIModel, prompt: string, apiKey: string) {
  const response = await fetch(model.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: model.maxTokens,
      temperature: model.temperature
    }),
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }
  
  return response.json();
}

async function callGemini(model: AIModel, prompt: string, apiKey: string) {
  const response = await fetch(`${model.apiEndpoint}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        maxOutputTokens: model.maxTokens,
        temperature: model.temperature
      }
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }
  
  return response.json();
}

async function callClaude(model: AIModel, prompt: string, apiKey: string) {
  const response = await fetch(model.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model.model,
      max_tokens: model.maxTokens,
      temperature: model.temperature,
      messages: [{ role: 'user', content: prompt }]
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }
  
  return response.json();
}

async function callGrok(model: AIModel, prompt: string, apiKey: string) {
  const response = await fetch(model.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: model.maxTokens,
      temperature: model.temperature
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Grok API error: ${response.status}`);
  }
  
  return response.json();
}

async function callMistral(model: AIModel, prompt: string, apiKey: string) {
  const response = await fetch(model.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: model.maxTokens,
      temperature: model.temperature
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Mistral API error: ${response.status}`);
  }
  
  return response.json();
}

async function callCohere(model: AIModel, prompt: string, apiKey: string) {
  const response = await fetch(model.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model.model,
      message: prompt,
      max_tokens: model.maxTokens,
      temperature: model.temperature
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Cohere API error: ${response.status}`);
  }
  
  return response.json();
}

async function callLlama(model: AIModel, prompt: string, apiKey: string) {
  const response = await fetch(model.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: model.maxTokens,
      temperature: model.temperature
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Llama API error: ${response.status}`);
  }
  
  return response.json();
}

async function callPerplexity(model: AIModel, prompt: string, apiKey: string) {
  const response = await fetch(model.apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: model.maxTokens,
      temperature: model.temperature
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.status}`);
  }
  
  return response.json();
}

// 유틸리티 함수들
function calculateScore(content: string, specialty: string): number {
  // 간단한 점수 계산 로직 (실제로는 더 정교한 평가 필요)
  const baseScore = Math.min(90 + Math.random() * 10, 100);
  const lengthBonus = Math.min(content.length / 100, 5);
  return Math.round(baseScore + lengthBonus);
}

function calculateConfidence(content: string): number {
  // 신뢰도 계산 (길이, 구체성 등 기반)
  const lengthFactor = Math.min(content.length / 500, 1);
  const structureFactor = content.includes('##') || content.includes('**') ? 0.2 : 0;
  return Math.round((lengthFactor + structureFactor) * 100);
}

function extractStrengths(content: string, specialty: string): string[] {
  const strengths = [specialty];
  if (content.includes('분석')) strengths.push('체계적 분석');
  if (content.includes('창의')) strengths.push('창의적 접근');
  if (content.includes('논리')) strengths.push('논리적 사고');
  if (content.includes('실용')) strengths.push('실용적 해결');
  return strengths.slice(0, 3);
}

function extractConcerns(content: string): string[] {
  const concerns = [];
  if (content.length < 200) concerns.push('응답 길이 부족');
  if (!content.includes('##') && !content.includes('**')) concerns.push('구조화 부족');
  if (content.includes('확실하지 않')) concerns.push('불확실성');
  return concerns.slice(0, 2);
}

function estimateTokenCount(content: string): number {
  return Math.ceil(content.length / 4); // 대략적인 토큰 수 계산
}

function calculateCost(model: AIModel, content: string): number {
  const tokenCount = estimateTokenCount(content);
  // 모델별 대략적인 비용 (실제 비용은 더 정확한 계산 필요)
  const costPerToken = {
    'gpt-4o': 0.00003,
    'gemini-pro': 0.000125,
    'claude-3-sonnet': 0.000015,
    'grok-beta': 0.00002,
    'mistral-large': 0.000008,
    'command-r-plus': 0.00003,
    'llama-3-1': 0.000001,
    'perplexity-online': 0.00002
  };
  
  return tokenCount * (costPerToken[model.id as keyof typeof costPerToken] || 0.00001);
}

// 오케스트레이션 모드별 처리
async function processParallelMode(
  selectedModels: AIModel[],
  prompt: string,
  apiKeys: Record<string, string>,
  timeoutMs: number
): Promise<AIResponse[]> {
  const promises = selectedModels.map(model => 
    Promise.race([
      callAIModel(model, prompt, apiKeys),
      new Promise<AIResponse>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeoutMs)
      )
    ]).catch(error => ({
      modelId: model.id,
      content: `타임아웃 또는 오류: ${error.message}`,
      score: 0,
      processingTime: timeoutMs,
      confidence: 0,
      strengths: [],
      concerns: ['타임아웃'],
      metadata: { tokenCount: 0, cost: 0 }
    }))
  );
  
  return Promise.all(promises);
}

async function processTournamentMode(
  selectedModels: AIModel[],
  prompt: string,
  apiKeys: Record<string, string>,
  rounds: number
): Promise<AIResponse[]> {
  let currentModels = [...selectedModels];
  let allResponses: AIResponse[] = [];
  
  for (let round = 0; round < rounds && currentModels.length > 1; round++) {
    const responses = await processParallelMode(currentModels, prompt, apiKeys, 30000);
    allResponses.push(...responses);
    
    // 상위 50% 모델만 다음 라운드 진출
    responses.sort((a, b) => b.score - a.score);
    const survivorCount = Math.max(1, Math.ceil(currentModels.length / 2));
    const survivorIds = responses.slice(0, survivorCount).map(r => r.modelId);
    currentModels = currentModels.filter(m => survivorIds.includes(m.id));
  }
  
  return allResponses;
}

// 메인 핸들러
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
    const { 
      query, 
      config = {
        mode: 'parallel',
        selectedModels: ['gpt-4o', 'gemini-pro', 'claude-3-sonnet', 'grok-beta'],
        rounds: 1,
        votingEnabled: false,
        timeoutMs: 30000,
        maxConcurrency: 8
      }
    }: { 
      query: string; 
      config?: Partial<OrchestrationConfig> 
    } = request.body;

    // 입력 검증
    if (!query || typeof query !== 'string') {
      return response.status(400).json({
        error: 'Invalid Input',
        message: 'Query is required and must be a string'
      });
    }

    if (query.length < 10 || query.length > 2000) {
      return response.status(400).json({
        error: 'Invalid Query Length',
        message: 'Query must be between 10 and 2000 characters'
      });
    }

    // API 키 수집
    const apiKeys = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
      XAI_API_KEY: process.env.XAI_API_KEY || '',
      MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || '',
      COHERE_API_KEY: process.env.COHERE_API_KEY || '',
      LLAMA_API_KEY: process.env.LLAMA_API_KEY || '',
      PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY || ''
    };

    // 선택된 모델들 필터링
    const selectedModels = AI_MODELS.filter(model => 
      config.selectedModels?.includes(model.id)
    );

    if (selectedModels.length === 0) {
      return response.status(400).json({
        error: 'No Valid Models',
        message: 'At least one valid model must be selected'
      });
    }

    console.log(`🎭 AI Orchestra 요청:`, {
      mode: config.mode,
      models: selectedModels.map(m => m.name),
      queryLength: query.length,
      timestamp: new Date().toISOString()
    });

    const startTime = Date.now();
    let responses: AIResponse[] = [];

    // 오케스트레이션 모드별 처리
    switch (config.mode) {
      case 'parallel':
        responses = await processParallelMode(selectedModels, query, apiKeys, config.timeoutMs || 30000);
        break;
        
      case 'tournament':
        responses = await processTournamentMode(selectedModels, query, apiKeys, config.rounds || 2);
        break;
        
      case 'debate':
      case 'consensus':
        // 향후 구현 예정
        responses = await processParallelMode(selectedModels, query, apiKeys, config.timeoutMs || 30000);
        break;
        
      default:
        responses = await processParallelMode(selectedModels, query, apiKeys, config.timeoutMs || 30000);
    }

    const totalProcessingTime = Date.now() - startTime;

    // 결과 정렬 (점수 기준)
    responses.sort((a, b) => b.score - a.score);

    // 최종 결과 구성
    const result = {
      orchestration: {
        mode: config.mode,
        totalModels: selectedModels.length,
        successfulResponses: responses.filter(r => r.score > 0).length,
        averageScore: responses.reduce((sum, r) => sum + r.score, 0) / responses.length,
        totalCost: responses.reduce((sum, r) => sum + r.metadata.cost, 0),
        processingTime: `${(totalProcessingTime / 1000).toFixed(1)}초`
      },
      responses: responses.map(r => ({
        model: selectedModels.find(m => m.id === r.modelId),
        response: r
      })),
      summary: {
        winner: responses[0]?.modelId || 'none',
        consensus: responses.filter(r => r.score > 85).length > responses.length / 2,
        topInsights: responses
          .filter(r => r.score > 80)
          .slice(0, 3)
          .map(r => r.content.substring(0, 200) + '...')
      }
    };

    return response.status(200).json({
      success: true,
      data: result,
      metadata: {
        requestId: `orchestra-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      }
    });

  } catch (error) {
    console.error('❌ AI Orchestra 오류:', error);

    return response.status(500).json({
      error: 'Internal Server Error',
      message: '오케스트레이션 처리 중 오류가 발생했습니다.',
      code: 'ORCHESTRA_ERROR',
      timestamp: new Date().toISOString()
    });
  }
}
