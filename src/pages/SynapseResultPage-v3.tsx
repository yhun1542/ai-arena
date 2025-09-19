import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  Users,
  Clock,
  Star,
  TrendingUp,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AITeamResult {
  name: string;
  model: string;
  score: number;
  strengths: string[];
  concerns: string[];
  finalAnswer: string;
  evidence: string[];
  sources: string[];
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
    content: string;
  };
}

// 처리 시간 계산 유틸리티 함수
function formatProcessingTime(processingTime: any): string {
  if (!processingTime) return "계산 중...";
  
  if (typeof processingTime === 'string') {
    if (processingTime.includes('초')) return processingTime;
    const parsed = parseFloat(processingTime);
    if (!isNaN(parsed)) return `${parsed.toFixed(1)}초`;
  }
  
  if (typeof processingTime === 'number') {
    if (isNaN(processingTime)) return "오류";
    if (processingTime > 1000) return `${(processingTime / 1000).toFixed(1)}초`;
    return `${processingTime.toFixed(1)}초`;
  }
  
  return "알 수 없음";
}

// 팀 색상 매핑
const getTeamColor = (teamName: string) => {
  const colorMap: { [key: string]: string } = {
    'GPT-4o': 'border-team-openai bg-team-openai/10',
    'Gemini Pro': 'border-team-google bg-team-google/10',
    'Claude 3.5': 'border-team-anthropic bg-team-anthropic/10',
    'Grok Beta': 'border-team-xai bg-team-xai/10'
  };
  return colorMap[teamName] || 'border-synapse-border bg-synapse-surface/30';
};

// 점수에 따른 등급 계산
const getScoreGrade = (score: number) => {
  if (score >= 95) return { grade: 'S', color: 'text-yellow-400' };
  if (score >= 90) return { grade: 'A+', color: 'text-green-400' };
  if (score >= 85) return { grade: 'A', color: 'text-green-500' };
  if (score >= 80) return { grade: 'B+', color: 'text-blue-400' };
  return { grade: 'B', color: 'text-blue-500' };
};

export default function SynapseResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  
  // 라우터 state에서 결과 데이터 가져오기
  const { result, query } = (location.state || {}) as {
    result: SynapseResult;
    query: string;
    useAdvanced: boolean;
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-synapse-bg flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-synapse-warning mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-synapse-text mb-2">결과를 찾을 수 없습니다</h1>
          <p className="text-synapse-text-muted mb-6">새로운 질문을 시작해주세요.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-synapse-primary text-white rounded-lg hover:bg-synapse-primary/80 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const topScore = Math.max(...result.teams.map(t => t.score));
  const avgScore = Math.round(result.teams.reduce((sum, t) => sum + t.score, 0) / result.teams.length);

  return (
    <div className="min-h-screen bg-synapse-bg">
      {/* 헤더 */}
      <header className="bg-synapse-surface border-b border-synapse-border sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-4 py-2 text-synapse-text-muted hover:text-synapse-text transition-colors rounded-lg hover:bg-synapse-bg"
              >
                <ArrowLeft className="w-4 h-4" />
                새 질문
              </button>
              <div className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-synapse-primary" />
                <span className="font-bold text-lg text-synapse-text">Synapse</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-synapse-text-muted">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>최고 점수: {topScore}/100</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>{result.metadata.complexity === 'advanced' ? '고급' : '표준'} 모드</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        
        {/* 질문 표시 */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-synapse-surface rounded-2xl p-6 border border-synapse-border">
            <h1 className="text-2xl font-bold mb-2 text-synapse-text">분석 완료</h1>
            <p className="text-lg text-synapse-text-muted mb-4">"{query}"</p>
            <div className="flex items-center gap-6 text-sm text-synapse-text-muted">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>처리 시간: {formatProcessingTime(result.metadata.processingTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{result.metadata.totalRounds}라운드 완료</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>평균 점수: {avgScore}/100</span>
              </div>
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
          <div className="bg-gradient-to-br from-synapse-surface to-synapse-surface/50 rounded-2xl p-8 border-2 border-synapse-primary/30 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-synapse-primary" />
              <h2 className="text-3xl font-bold text-synapse-text">최종 결론</h2>
              <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-synapse-primary/20 rounded-full">
                <Star className="w-4 h-4 text-synapse-primary" />
                <span className="text-sm font-semibold text-synapse-primary">AI 협업 완료</span>
              </div>
            </div>
            
            <div className="space-y-8">
              {/* 핵심 요약 */}
              <div>
                <h3 className="flex items-center gap-2 text-xl font-bold mb-4 text-synapse-text">
                  <CheckCircle className="w-6 h-6 text-synapse-success" />
                  핵심 요약
                </h3>
                <div className="space-y-3">
                  {result.finalAnswer.summary.map((point, index) => (
                    <div key={index} className="p-4 bg-synapse-bg/50 rounded-lg border border-synapse-border">
                      <div className="prose prose-synapse max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({children}) => <p className="text-synapse-text leading-relaxed m-0">{children}</p>,
                            strong: ({children}) => <strong className="font-bold text-synapse-primary">{children}</strong>,
                          }}
                        >
                          {point}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 주요 근거 */}
              <div>
                <h3 className="flex items-center gap-2 text-xl font-bold mb-4 text-synapse-text">
                  <BarChart2 className="w-6 h-6 text-synapse-warning" />
                  주요 근거
                </h3>
                <div className="space-y-4">
                  {result.finalAnswer.evidence.map((evidence, index) => (
                    <div key={index} className="p-6 bg-synapse-surface/50 rounded-xl border border-synapse-border">
                      <div className="prose prose-synapse max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({children}) => <h1 className="text-xl font-bold text-synapse-text mb-3">{children}</h1>,
                            h2: ({children}) => <h2 className="text-lg font-bold text-synapse-text mb-2">{children}</h2>,
                            h3: ({children}) => <h3 className="text-base font-bold text-synapse-text mb-2">{children}</h3>,
                            p: ({children}) => <p className="text-synapse-text mb-3 leading-relaxed">{children}</p>,
                            ul: ({children}) => <ul className="list-disc list-inside space-y-2 text-synapse-text ml-4">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal list-inside space-y-2 text-synapse-text ml-4">{children}</ol>,
                            li: ({children}) => <li className="text-synapse-text">{children}</li>,
                            strong: ({children}) => <strong className="font-bold text-synapse-primary">{children}</strong>,
                            em: ({children}) => <em className="italic text-synapse-text-muted">{children}</em>,
                            code: ({children}) => <code className="bg-synapse-bg px-2 py-1 rounded text-sm font-mono text-synapse-primary">{children}</code>,
                            blockquote: ({children}) => <blockquote className="border-l-4 border-synapse-primary pl-4 italic text-synapse-text-muted">{children}</blockquote>,
                          }}
                        >
                          {evidence}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 실행 체크리스트 */}
              <div>
                <h3 className="flex items-center gap-2 text-xl font-bold mb-4 text-synapse-text">
                  <CheckCircle className="w-6 h-6 text-synapse-info" />
                  실행 체크리스트
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.finalAnswer.checkList.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-synapse-surface/30 rounded-lg border border-synapse-border hover:border-synapse-primary/50 transition-colors">
                      <CheckCircle className="w-5 h-5 text-synapse-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-synapse-text leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* AI 팀 비교 요약 */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-synapse-text flex items-center gap-2">
            <Users className="w-7 h-7 text-synapse-secondary" />
            AI 팀 분석 결과
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {result.teams.map((team, index) => {
              const { grade, color } = getScoreGrade(team.score);
              return (
                <div key={index} className={`${getTeamColor(team.name)} rounded-xl p-6 border-2 transition-all duration-200 hover:scale-105`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-synapse-text">{team.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${color}`}>{grade}</span>
                      <span className="text-sm text-synapse-text-muted">{team.score}/100</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-synapse-success mb-1">✅ 강점</p>
                      <ul className="text-xs text-synapse-text space-y-1">
                        {team.strengths.map((strength, i) => (
                          <li key={i}>• {strength}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <p className="text-xs font-semibold text-synapse-warning mb-1">⚠️ 주의점</p>
                      <ul className="text-xs text-synapse-text space-y-1">
                        {team.concerns.map((concern, i) => (
                          <li key={i}>• {concern}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* 토론 하이라이트 및 상세 로그 */}
        <motion.section 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="bg-synapse-surface rounded-xl border border-synapse-border overflow-hidden">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full p-6 text-left hover:bg-synapse-bg/30 transition-colors flex items-center justify-between"
            >
              <h2 className="text-xl font-bold text-synapse-text flex items-center gap-2">
                <Zap className="w-6 h-6 text-synapse-secondary" />
                토론 하이라이트 및 상세 로그
              </h2>
              {showDetails ? (
                <ChevronUp className="w-5 h-5 text-synapse-text-muted" />
              ) : (
                <ChevronDown className="w-5 h-5 text-synapse-text-muted" />
              )}
            </button>
            
            {showDetails && (
              <div className="border-t border-synapse-border p-6 space-y-4">
                {result.highlights.map((highlight, index) => {
                  const icons = {
                    flame: <Flame className="w-5 h-5 text-red-500" />,
                    insight: <Zap className="w-5 h-5 text-yellow-500" />,
                    defense: <Shield className="w-5 h-5 text-green-500" />
                  };
                  
                  const labels = {
                    flame: '결정적 반박',
                    insight: '핵심 통찰',
                    defense: '논리적 방어'
                  };
                  
                  return (
                    <div key={index} className="flex items-start gap-3 p-4 bg-synapse-bg/30 rounded-lg">
                      {icons[highlight.type]}
                      <div>
                        <span className="font-semibold text-synapse-text">
                          {labels[highlight.type]}
                        </span>
                        <span className="text-xs text-synapse-text-muted ml-2">
                          (Round {highlight.round})
                        </span>
                        <p className="text-sm text-synapse-text mt-1">{highlight.content}</p>
                      </div>
                    </div>
                  );
                })}
                
                <div className="mt-6 p-4 bg-synapse-primary/10 rounded-lg border border-synapse-primary/30">
                  <p className="text-sm text-synapse-text">
                    <strong>프로세스 요약:</strong> 4라운드에 걸쳐 Answerer → Critic → Researcher → Synthesizer 역할을 순환하며 
                    각 AI 모델이 협업하여 최종 결론을 도출했습니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* 새 질문 버튼 */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 bg-gradient-to-r from-synapse-primary to-synapse-secondary text-white font-bold text-lg rounded-full hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-3 mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            새로운 질문 시작하기
          </button>
        </motion.div>

      </div>
    </div>
  );
}
