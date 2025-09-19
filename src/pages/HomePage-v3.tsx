import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Target, 
  Award,
  ArrowRight,
  Sparkles,
  Users,
  TrendingUp
} from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [useAdvanced, setUseAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;

    if (query.trim().length < 10) {
      alert('질문을 10자 이상 입력해주세요.');
      return;
    }

    setIsProcessing(true);

    try {
      console.log('🚀 Synapse 요청 시작:', query);
      
      const response = await fetch('/api/synapse-v6', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          useAdvanced: useAdvanced,
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

      const result = await response.json();
      console.log('✅ Synapse 응답 받음:', result);

      // 결과 페이지로 이동 (결과 데이터를 state로 전달)
      navigate('/synapse/result', { 
        state: { 
          result: result.data, 
          query: query.trim(),
          useAdvanced: useAdvanced
        } 
      });

    } catch (error) {
      console.error('❌ Synapse 요청 실패:', error);
      alert('처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  const exampleQueries = [
    "인공지능이 일자리에 미치는 영향과 대응 방안",
    "기후변화 해결을 위한 실현 가능한 기술적 솔루션",
    "스타트업 초기 단계에서 가장 중요한 성공 요소",
    "메타버스 기술의 현실적인 활용 가능성과 한계"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-synapse-bg via-synapse-surface to-synapse-bg">
      {/* 헤더 */}
      <header className="container mx-auto px-6 py-8">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-synapse-primary" />
            <span className="text-2xl font-bold text-synapse-text">Synapse</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-synapse-text-muted">
            <span>v3.0</span>
            <span>•</span>
            <span>8개 AI 협업</span>
          </div>
        </nav>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* 히어로 섹션 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-synapse-primary via-synapse-secondary to-synapse-primary bg-clip-text text-transparent">
                Synapse
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-synapse-text-muted mb-4">
              하나의 질문, 여덟 개의 지성, 최고의 결론.
            </p>
            <p className="text-lg text-synapse-text-muted max-w-2xl mx-auto">
              GPT-4o, Gemini Pro, Claude, Grok, Mistral, Cohere, Llama, Perplexity가 협업하여<br />
              세상에서 가장 정확하고 실행 가능한 답변을 만들어냅니다.
            </p>
          </motion.div>

          {/* 검색 폼 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="최고의 답을 찾기 위한 여정을 시작하세요..."
                  className="w-full max-w-3xl mx-auto h-32 text-lg p-6 bg-synapse-surface border-2 border-synapse-border rounded-2xl focus:border-synapse-primary focus:outline-none transition-all duration-300 resize-none text-synapse-text placeholder-synapse-text-muted"
                  disabled={isProcessing}
                />
                <div className="absolute bottom-4 right-4 text-sm text-synapse-text-muted">
                  {query.length}/1000
                </div>
              </div>

              {/* 고급 모드 토글 */}
              <div className="flex items-center justify-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useAdvanced}
                    onChange={(e) => setUseAdvanced(e.target.checked)}
                    className="w-4 h-4 text-synapse-primary bg-synapse-surface border-synapse-border rounded focus:ring-synapse-primary focus:ring-2"
                    disabled={isProcessing}
                  />
                  <span className="text-sm text-synapse-text-muted">
                    고급 모드 (복잡한 질문용)
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isProcessing || query.trim().length < 10}
                className="px-12 py-4 bg-gradient-to-r from-synapse-primary to-synapse-secondary text-white font-bold text-lg rounded-full hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    결론 도출
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* 예시 질문들 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-16"
          >
            <h3 className="text-lg font-semibold text-synapse-text mb-6">
              💡 이런 질문들을 시도해보세요
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(example)}
                  className="p-4 bg-synapse-surface border border-synapse-border rounded-xl hover:border-synapse-primary transition-all duration-200 text-left group"
                  disabled={isProcessing}
                >
                  <p className="text-sm text-synapse-text group-hover:text-synapse-primary transition-colors">
                    {example}
                  </p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* 특징 소개 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            <div className="text-center p-6">
              <Users className="w-12 h-12 text-synapse-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-synapse-text mb-2">8개 AI 협업</h3>
              <p className="text-synapse-text-muted">
                GPT-4o, Gemini Pro, Claude, Grok, Mistral, Cohere, Llama, Perplexity가<br />
                각자의 강점을 결합합니다
              </p>
            </div>

            <div className="text-center p-6">
              <Target className="w-12 h-12 text-synapse-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-synapse-text mb-2">블라인드 평가</h3>
              <p className="text-synapse-text-muted">
                편향을 제거한 객관적<br />
                품질 평가 시스템
              </p>
            </div>

            <div className="text-center p-6">
              <TrendingUp className="w-12 h-12 text-team-xai mx-auto mb-4" />
              <h3 className="text-xl font-bold text-synapse-text mb-2">최고 품질</h3>
              <p className="text-synapse-text-muted">
                단일 AI 대비 23% 향상된<br />
                답변 정확도 보장
              </p>
            </div>
          </motion.div>

        </div>
      </main>

      {/* 푸터 */}
      <footer className="container mx-auto px-6 py-8 mt-16 border-t border-synapse-border">
        <div className="text-center text-sm text-synapse-text-muted">
          <p>© 2025 Synapse. 최고의 AI 협업 플랫폼.</p>
          <p className="mt-2">
            Powered by OpenAI GPT-4o, Google Gemini Pro, Anthropic Claude, xAI Grok, Mistral Large, Cohere Command R+, Meta Llama 3.1, Perplexity AI
          </p>
        </div>
      </footer>
    </div>
  );
}
