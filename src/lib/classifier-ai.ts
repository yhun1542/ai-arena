// Synapse v3 - 분류 AI 시스템

import { AIClientFactory } from './ai-clients-v3';

interface ClassificationResult {
  complexity: 'standard' | 'advanced';
  confidence: number;
  reasoning: string;
  recommendedModels: {
    openai: string;
    google: string;
    anthropic: string;
    xai: string;
  };
  estimatedProcessingTime: number;
  suggestedPersona: {
    level: 'beginner' | 'intermediate' | 'expert';
    tone: 'casual' | 'formal' | 'academic';
    length: 'brief' | 'detailed' | 'comprehensive';
  };
}

interface UserContext {
  previousQueries?: string[];
  preferredComplexity?: 'standard' | 'advanced';
  domainExpertise?: string[];
  timeConstraint?: 'urgent' | 'normal' | 'thorough';
}

export class ClassifierAI {
  private static readonly CLASSIFICATION_PROMPT = `당신은 질문의 복잡도와 최적의 AI 모델을 선택하는 전문 분류 AI입니다.

주어진 질문을 분석하여 다음 기준으로 분류해주세요:

**복잡도 판단 기준:**

**STANDARD (표준) 모드:**
- 일반적인 정보 요청
- 간단한 설명이나 정의
- 기본적인 비교나 분석
- 일상적인 문제 해결
- 명확한 답이 있는 질문

**ADVANCED (고급) 모드:**
- 복잡한 학술 연구나 분석
- 다단계 추론이 필요한 문제
- 전문 지식이 요구되는 질문
- 창의적 문제 해결
- 대규모 데이터 분석
- PhD 수준의 깊이 있는 탐구
- 윤리적/철학적 딜레마
- 복합적인 시스템 설계

**응답 형식 (JSON):**
{
  "complexity": "standard" | "advanced",
  "confidence": 0.0-1.0,
  "reasoning": "판단 근거 설명",
  "estimatedProcessingTime": 예상 처리 시간(초),
  "suggestedPersona": {
    "level": "beginner" | "intermediate" | "expert",
    "tone": "casual" | "formal" | "academic", 
    "length": "brief" | "detailed" | "comprehensive"
  },
  "keywordAnalysis": {
    "technicalTerms": ["추출된", "전문용어"],
    "complexityIndicators": ["복잡도", "지표들"],
    "domainArea": "추정 분야"
  }
}

**분석할 질문:** `;

  private static readonly STANDARD_MODELS = {
    openai: 'gpt-4o',
    google: 'gemini-1.5-pro',
    anthropic: 'claude-3-5-sonnet-20241022',
    xai: 'grok-beta',
  };

  private static readonly ADVANCED_MODELS = {
    openai: 'gpt-4o', // 현재 최고 모델
    google: 'gemini-1.5-pro', // 향후 deepthink 버전으로 업그레이드
    anthropic: 'claude-3-5-sonnet-20241022',
    xai: 'grok-beta', // 향후 heavy 버전으로 업그레이드
  };

  static async classifyQuery(
    query: string,
    userContext?: UserContext
  ): Promise<ClassificationResult> {
    try {
      console.log('🔍 분류 AI 시작:', query.slice(0, 100) + '...');
      
      // 1. 기본 휴리스틱 분석
      const heuristicResult = this.performHeuristicAnalysis(query);
      
      // 2. AI 기반 분류 (OpenAI 사용)
      const aiClassification = await this.performAIClassification(query, userContext);
      
      // 3. 결과 통합
      const finalResult = this.combineResults(heuristicResult, aiClassification, userContext);
      
      console.log('✅ 분류 완료:', {
        complexity: finalResult.complexity,
        confidence: finalResult.confidence,
        models: finalResult.recommendedModels
      });
      
      return finalResult;
      
    } catch (error) {
      console.error('❌ 분류 AI 오류:', error);
      
      // 실패 시 안전한 기본값 반환
      return this.getDefaultClassification(query);
    }
  }

  private static performHeuristicAnalysis(query: string): Partial<ClassificationResult> {
    const queryLower = query.toLowerCase();
    const queryLength = query.length;
    
    // 복잡도 지표 키워드
    const advancedIndicators = [
      // 학술/연구
      '논문', '연구', '분석', '메타분석', '체계적 검토', '실험 설계',
      'research', 'analysis', 'meta-analysis', 'systematic review', 'experimental design',
      
      // 기술/전문
      '알고리즘', '아키텍처', '구현', '최적화', '설계', '모델링', '시뮬레이션',
      'algorithm', 'architecture', 'implementation', 'optimization', 'modeling', 'simulation',
      
      // 복잡한 추론
      '전략', '계획', '예측', '시나리오', '프레임워크', '방법론',
      'strategy', 'planning', 'prediction', 'scenario', 'framework', 'methodology',
      
      // 다단계 질문
      '단계별', '과정', '절차', '어떻게', '왜', '비교분석',
      'step-by-step', 'process', 'procedure', 'how to', 'why', 'comparative analysis',
      
      // 전문 분야
      '머신러닝', '딥러닝', '블록체인', '양자컴퓨팅', '바이오테크', '나노기술',
      'machine learning', 'deep learning', 'blockchain', 'quantum computing', 'biotech', 'nanotech'
    ];
    
    const standardIndicators = [
      '뭐야', '무엇', '언제', '어디서', '누구', '정의', '설명',
      'what is', 'when', 'where', 'who', 'definition', 'explain', 'simple'
    ];
    
    // 지표 카운트
    const advancedCount = advancedIndicators.filter(indicator => 
      queryLower.includes(indicator)
    ).length;
    
    const standardCount = standardIndicators.filter(indicator => 
      queryLower.includes(indicator)
    ).length;
    
    // 복잡도 판단
    let complexity: 'standard' | 'advanced' = 'standard';
    let confidence = 0.6;
    
    if (queryLength > 200 || advancedCount >= 3) {
      complexity = 'advanced';
      confidence = 0.8;
    } else if (advancedCount >= 1 && standardCount === 0) {
      complexity = 'advanced';
      confidence = 0.7;
    } else if (standardCount >= 2) {
      complexity = 'standard';
      confidence = 0.8;
    }
    
    // 처리 시간 추정
    const estimatedProcessingTime = complexity === 'advanced' ? 
      Math.max(15, Math.min(45, queryLength / 10)) : 
      Math.max(8, Math.min(20, queryLength / 15));
    
    return {
      complexity,
      confidence,
      estimatedProcessingTime,
      reasoning: `휴리스틱 분석: 길이=${queryLength}, 고급지표=${advancedCount}, 기본지표=${standardCount}`
    };
  }

  private static async performAIClassification(
    query: string,
    userContext?: UserContext
  ): Promise<Partial<ClassificationResult>> {
    try {
      const contextInfo = userContext ? `
사용자 컨텍스트:
- 이전 질문들: ${userContext.previousQueries?.slice(-3).join(', ') || '없음'}
- 선호 복잡도: ${userContext.preferredComplexity || '없음'}
- 전문 분야: ${userContext.domainExpertise?.join(', ') || '없음'}
- 시간 제약: ${userContext.timeConstraint || '보통'}
` : '';

      const fullPrompt = `${this.CLASSIFICATION_PROMPT}${contextInfo}

"${query}"

위 질문을 분석하여 JSON 형식으로 응답해주세요.`;

      const response = await AIClientFactory.callAI('openai', 'gpt-4o', fullPrompt, {
        temperature: 0.3, // 일관성을 위해 낮은 온도
        maxTokens: 500,
      });

      // JSON 파싱 시도
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          complexity: parsed.complexity,
          confidence: Math.min(parsed.confidence, 0.95), // AI 과신 방지
          reasoning: `AI 분석: ${parsed.reasoning}`,
          estimatedProcessingTime: parsed.estimatedProcessingTime,
          suggestedPersona: parsed.suggestedPersona,
        };
      }
      
      throw new Error('JSON 파싱 실패');
      
    } catch (error) {
      console.error('AI 분류 실패:', error);
      return {
        reasoning: 'AI 분류 실패, 휴리스틱 결과 사용'
      };
    }
  }

  private static combineResults(
    heuristic: Partial<ClassificationResult>,
    aiResult: Partial<ClassificationResult>,
    userContext?: UserContext
  ): ClassificationResult {
    // 복잡도 결정 (AI 결과 우선, 휴리스틱으로 보완)
    let finalComplexity = aiResult.complexity || heuristic.complexity || 'standard';
    
    // 사용자 선호도 반영
    if (userContext?.preferredComplexity) {
      finalComplexity = userContext.preferredComplexity;
    }
    
    // 신뢰도 계산 (두 결과가 일치하면 높게)
    const confidence = aiResult.complexity === heuristic.complexity ? 
      Math.max(aiResult.confidence || 0, heuristic.confidence || 0) :
      Math.min(aiResult.confidence || 0.6, heuristic.confidence || 0.6);
    
    // 모델 선택
    const recommendedModels = finalComplexity === 'advanced' ? 
      this.ADVANCED_MODELS : this.STANDARD_MODELS;
    
    // 페르소나 결정
    const suggestedPersona = aiResult.suggestedPersona || {
      level: finalComplexity === 'advanced' ? 'expert' : 'intermediate',
      tone: 'formal',
      length: finalComplexity === 'advanced' ? 'comprehensive' : 'detailed'
    };
    
    // 처리 시간 추정
    const estimatedProcessingTime = aiResult.estimatedProcessingTime || 
      heuristic.estimatedProcessingTime || 
      (finalComplexity === 'advanced' ? 25 : 12);
    
    return {
      complexity: finalComplexity,
      confidence,
      reasoning: `${heuristic.reasoning} | ${aiResult.reasoning}`,
      recommendedModels,
      estimatedProcessingTime,
      suggestedPersona,
    };
  }

  private static getDefaultClassification(query: string): ClassificationResult {
    // 안전한 기본값
    const isLongQuery = query.length > 150;
    const complexity = isLongQuery ? 'advanced' : 'standard';
    
    return {
      complexity,
      confidence: 0.5,
      reasoning: '분류 AI 실패로 인한 기본값 사용',
      recommendedModels: complexity === 'advanced' ? this.ADVANCED_MODELS : this.STANDARD_MODELS,
      estimatedProcessingTime: complexity === 'advanced' ? 20 : 10,
      suggestedPersona: {
        level: 'intermediate',
        tone: 'formal',
        length: 'detailed'
      },
    };
  }

  // 사용자 피드백을 통한 학습 (향후 구현)
  static async learnFromFeedback(
    query: string,
    actualComplexity: 'standard' | 'advanced',
    userSatisfaction: number
  ): Promise<void> {
    // TODO: 사용자 피드백을 데이터베이스에 저장하여 분류 정확도 개선
    console.log('📊 피드백 수집:', {
      query: query.slice(0, 50),
      actualComplexity,
      satisfaction: userSatisfaction
    });
  }
}
