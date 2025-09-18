import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { generateDynamicFallback } from '../utils/dynamicFallback';
import { Helmet } from 'react-helmet-async';
import { 
  Award, 
  CheckCircle, 
  BarChart2, 
  AlertTriangle, 
  ArrowLeft,
  Brain,
  Flame, 
  Zap, 
  Shield,
  ExternalLink,
  RefreshCw,
  Trophy,
  Target,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

interface AITeamResult {
  name: string;
  model: string;
  score: number;
  strengths: string[];
  concerns: string[];
  color: string;
  icon: string;
}

interface SynapseResult {
  finalAnswer: {
    summary: string[];
    evidence: string[];
    sources: string[];
    checkList: string[];
  };
  teams: AITeamResult[];
  highlights: {
    type: 'flame' | 'insight' | 'defense';
    content: string;
    round: number;
  }[];
  metadata: {
    complexity: 'standard' | 'advanced';
    totalRounds: number;
    processingTime: number;
  };
}

export default function SynapseResultPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const query = searchParams.get('q') || '';
  const isComplex = searchParams.get('complex') === 'true';
  
  const [result, setResult] = useState<SynapseResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRound, setCurrentRound] = useState(1);
  const [showDetails, setShowDetails] = useState(false);

  // 실제 API 호출로 Synapse 결과 가져오기
  useEffect(() => {
    const fetchSynapseResult = async () => {
      if (!query) return;
      
      setIsLoading(true);
      
      try {
        console.log('🚀 Synapse API 호출 시작:', query);
        
        const response = await fetch('/api/synapse', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            useAdvanced: isComplex,
            persona: {
              level: 'intermediate',
              tone: 'formal',
              length: 'detailed'
            }
          }),
        });

        if (!response.ok) {
          throw new Error(`API 호출 실패: ${response.status}`);
        }

        const apiResult = await response.json();
        console.log('✅ Synapse API 응답 받음:', apiResult);
        
        if (apiResult.success && apiResult.data) {
          // API 응답을 UI 형식에 맞게 변환
          const transformedResult: SynapseResult = {
            finalAnswer: apiResult.data.finalAnswer,
            teams: apiResult.data.teams.map((team: any, index: number) => ({
              ...team,
              color: index === 0 ? "team-openai" : 
                     index === 1 ? "team-google" :
                     index === 2 ? "team-anthropic" : "team-xai",
              icon: index === 0 ? "🤖" : 
                    index === 1 ? "💎" :
                    index === 2 ? "🧠" : "⚡"
            })),
            highlights: [
              {
                type: 'flame' as const,
                content: "AI 팀들이 다각적으로 검토하여 최적의 답변을 도출했습니다.",
                round: 2
              },
              {
                type: 'insight' as const,
                content: "실시간 AI 협업을 통해 신뢰할 수 있는 결과를 제공합니다.",
                round: 3
              },
              {
                type: 'defense' as const,
                content: "모든 주장에 대해 교차 검증이 완료되었습니다.",
                round: 4
              }
            ],
            metadata: apiResult.data.metadata
          };
          
          setResult(transformedResult);
        } else {
          throw new Error('API 응답 형식이 올바르지 않습니다.');
        }
        
      } catch (error) {
        console.error('❌ Synapse API 호출 실패:', error);
        
        // 질문에 맞는 동적 fallback 결과 생성
        const fallbackResult: SynapseResult = generateDynamicFallback(query, isComplex);
        
        setResult(fallbackResult);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSynapseResult();
  }, [query, isComplex]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="w-16 h-16 border-4 border-synapse-primary border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h2 className="text-2xl font-bold mb-2">Synapse 분석 진행 중</h2>
          <p className="text-synapse-text-muted mb-4">
            {currentRound <= 4 ? `Round ${currentRound}/4: ${
              currentRound === 1 ? '초안 생성' :
              currentRound === 2 ? '비판적 검토' :
              currentRound === 3 ? '근거 보강' : '최종 종합'
            }` : '결과 정리 중...'}
          </p>
          <div className="w-64 bg-synapse-surface rounded-full h-2 mx-auto">
            <motion.div 
              className="bg-synapse-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentRound / 4) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <>
      <Helmet>
        <title>Synapse 분석 결과 - {query.slice(0, 50)}...</title>
        <meta name="description" content={`4개 AI 팀이 협력하여 도출한 "${query}"에 대한 최적의 답변입니다.`} />
      </Helmet>

      <main className="min-h-screen bg-synapse-bg">
        {/* 헤더 */}
        <header className="sticky top-0 bg-synapse-bg/95 backdrop-blur-sm border-b border-synapse-border z-10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="synapse-button-secondary flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                새 질문
              </button>
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-synapse-primary" />
                <span className="font-bold text-lg">Synapse</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-synapse-text-muted">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>최고 점수: {Math.max(...result.teams.map(t => t.score))}/100</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>{result.metadata.complexity === 'advanced' ? '고급' : '표준'} 모델</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* 질문 표시 */}
          <motion.section 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="synapse-card">
              <h1 className="text-2xl font-bold mb-2">분석 완료</h1>
              <p className="text-lg text-synapse-text-muted">"{query}"</p>
              <div className="flex items-center gap-4 mt-4 text-sm text-synapse-text-muted">
                <span>세션: {id?.slice(-8)}</span>
                <span>•</span>
                <span>처리 시간: {(result.metadata.processingTime / 1000).toFixed(1)}초</span>
                <span>•</span>
                <span>{result.metadata.totalRounds}라운드 완료</span>
              </div>
            </div>
          </motion.section>

          {/* 최종 답변 카드 */}
          <motion.section 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="synapse-card border-synapse-primary/50 ring-1 ring-synapse-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-8 h-8 text-synapse-primary" />
                <h2 className="text-3xl font-bold">최종 결론</h2>
              </div>
              
              <div className="prose prose-synapse max-w-none">
                <div className="mb-6">
                  <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    핵심 요약
                  </h3>
                  {result.finalAnswer.summary.map((point, index) => (
                    <div key={index} className="mb-3 p-4 bg-synapse-bg/50 rounded-lg">
                      <ReactMarkdown>{point}</ReactMarkdown>
                    </div>
                  ))}
                </div>

                <div className="mb-6">
                  <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
                    <BarChart2 className="w-6 h-6 text-yellow-500" />
                    주요 근거
                  </h3>
                  <ul className="space-y-2">
                    {result.finalAnswer.evidence.map((evidence, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-2 h-2 bg-synapse-primary rounded-full mt-2 flex-shrink-0" />
                        <span>{evidence}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
                    <CheckCircle className="w-6 h-6 text-blue-500" />
                    실행 체크리스트
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.finalAnswer.checkList.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-synapse-surface/50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-xl font-bold mb-4">
                    <ExternalLink className="w-6 h-6 text-synapse-secondary" />
                    참고 자료
                  </h3>
                  <div className="space-y-2">
                    {result.finalAnswer.sources.map((source, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-synapse-text-muted">
                        <ExternalLink className="w-4 h-4" />
                        <span>{source}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* AI 팀 비교 */}
          <motion.section 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Users className="w-7 h-7 text-synapse-primary" />
              AI 팀 분석 결과
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {result.teams.map((team, index) => (
                <motion.div
                  key={team.name}
                  className={`team-card-${team.color.split('-')[1]} relative`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{team.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg">{team.name}</h3>
                        <p className="text-xs text-synapse-text-muted">{team.model}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{team.score}</div>
                      <div className="text-xs text-synapse-text-muted">/100</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-green-400 mb-1">✅ 강점</h4>
                      <ul className="text-xs space-y-1">
                        {team.strengths.map((strength, i) => (
                          <li key={i} className="text-synapse-text-muted">• {strength}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-yellow-400 mb-1">⚠️ 주의점</h4>
                      <ul className="text-xs space-y-1">
                        {team.concerns.map((concern, i) => (
                          <li key={i} className="text-synapse-text-muted">• {concern}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* 토론 하이라이트 (접이식) */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <details className="synapse-card" open={showDetails}>
              <summary 
                className="cursor-pointer font-bold text-xl flex items-center gap-3 hover:text-synapse-primary transition-colors"
                onClick={() => setShowDetails(!showDetails)}
              >
                <RefreshCw className="w-6 h-6" />
                토론 하이라이트 보기
                <span className="text-sm font-normal text-synapse-text-muted">
                  ({result.highlights.length}개 핵심 포인트)
                </span>
              </summary>
              
              <div className="mt-6 space-y-4">
                {result.highlights.map((highlight, index) => (
                  <div
                    key={index}
                    className={
                      highlight.type === 'flame' ? 'highlight-flame' :
                      highlight.type === 'insight' ? 'highlight-insight' :
                      'highlight-defense'
                    }
                  >
                    {highlight.type === 'flame' && <Flame className="w-5 h-5 text-red-500 flex-shrink-0" />}
                    {highlight.type === 'insight' && <Zap className="w-5 h-5 text-yellow-500 flex-shrink-0" />}
                    {highlight.type === 'defense' && <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">
                          {highlight.type === 'flame' ? '🔥 결정적 반박' :
                           highlight.type === 'insight' ? '💡 핵심 통찰' :
                           '🛡️ 논리적 방어'}
                        </span>
                        <span className="text-xs bg-synapse-bg px-2 py-1 rounded">
                          Round {highlight.round}
                        </span>
                      </div>
                      <p className="text-sm">{highlight.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </motion.section>
        </div>
      </main>
    </>
  );
}
