import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { 
  Brain, 
  Zap, 
  Target, 
  ArrowRight, 
  Sparkles,
  Users,
  Trophy,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    // 질문 복잡도 분석 (간단한 키워드 기반)
    const complexKeywords = ['연구', '분석', '비교', '전략', '시스템', '알고리즘', '아키텍처', '최적화'];
    const isComplex = complexKeywords.some(keyword => query.includes(keyword)) || query.length > 100;
    
    // 토론 ID 생성
    const discussionId = `synapse-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 결과 페이지로 이동
    navigate(`/discussion/${discussionId}?q=${encodeURIComponent(query)}&complex=${isComplex}`);
  };

  const exampleQueries = [
    "블록체인 기술의 실제 비즈니스 적용 방안은?",
    "AI 시대에 필요한 핵심 역량과 학습 전략",
    "탄소중립을 위한 기업의 실행 가능한 로드맵",
    "메타버스 플랫폼의 수익화 모델 비교 분석"
  ];

  return (
    <>
      <Helmet>
        <title>Synapse - 하나의 질문, 네 개의 지성, 최고의 결론</title>
        <meta name="description" content="4개의 최고 AI가 협력하여 당신의 질문에 대한 최적의 답변을 제공합니다. 토론이 아닌 결과로 증명하는 차세대 AI 서비스." />
      </Helmet>

      <main className="min-h-screen flex flex-col">
        {/* 헤더 */}
        <header className="p-6 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Brain className="w-8 h-8 text-synapse-primary" />
            <span className="text-2xl font-bold gradient-text">Synapse</span>
          </motion.div>
          
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 text-sm text-synapse-text-muted">
              <Users className="w-4 h-4" />
              <span>4개 AI 팀 대기 중</span>
            </div>
          </motion.div>
        </header>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-4xl w-full text-center">
            
            {/* 메인 타이틀 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl md:text-8xl font-bold mb-6">
                <span className="gradient-text">Synapse</span>
              </h1>
              
              <p className="text-xl md:text-3xl text-synapse-text-muted mb-4 text-balance">
                하나의 질문, 네 개의 지성, 최고의 결론.
              </p>
              
              <p className="text-lg md:text-xl text-synapse-text-muted/80 mb-12 text-balance">
                최고의 답을 찾기 위한 여정을 시작하세요.
              </p>
            </motion.div>

            {/* 검색 폼 */}
            <motion.form 
              onSubmit={handleSubmit}
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative max-w-3xl mx-auto">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="최고의 답을 찾기 위한 여정을 시작하세요."
                  className="synapse-textarea-enhanced text-xl py-6 px-8 pr-20 min-h-[120px] text-center resize-none"
                  rows={1}
                  disabled={isAnalyzing}
                  style={{
                    height: 'auto',
                    minHeight: '120px'
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.max(120, e.target.scrollHeight)}px`;
                  }}
                />
                <button
                  type="submit"
                  disabled={!query.trim() || isAnalyzing}
                  className="synapse-search-button disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <Sparkles className="w-6 h-6 animate-spin" />
                  ) : (
                    <Search className="w-6 h-6" />
                  )}
                </button>
              </div>
            </motion.form>

            {/* 예시 질문들 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <p className="text-sm text-synapse-text-muted mb-4">💡 이런 질문들을 시도해보세요:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl mx-auto">
                {exampleQueries.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setQuery(example)}
                    className="p-4 bg-synapse-surface/50 hover:bg-synapse-surface border border-synapse-border hover:border-synapse-primary/50 rounded-xl text-left text-sm transition-all duration-200 group"
                  >
                    <span className="text-synapse-text-muted group-hover:text-synapse-text">
                      {example}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* 특징 섹션 */}
        <motion.section 
          className="py-16 px-6 border-t border-synapse-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="text-center">
                <div className="w-16 h-16 bg-synapse-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-synapse-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">4개 AI 협력</h3>
                <p className="text-synapse-text-muted">
                  GPT-4o, Gemini, Claude, Grok이 각자의 강점을 발휘하여 최적의 답변을 도출합니다.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-synapse-secondary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-synapse-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-2">블라인드 평가</h3>
                <p className="text-synapse-text-muted">
                  편향을 제거한 객관적 평가로 진정한 최고 품질의 답변만을 선별합니다.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-team-openai/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-team-openai" />
                </div>
                <h3 className="text-xl font-bold mb-2">결과 중심</h3>
                <p className="text-synapse-text-muted">
                  토론 과정이 아닌 최종 결과물의 품질로만 승부하는 차세대 AI 서비스입니다.
                </p>
              </div>

            </div>
          </div>
        </motion.section>
      </main>
    </>
  );
}
