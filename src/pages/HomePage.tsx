import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { 
  Brain, 
  Search,
  Sparkles
} from 'lucide-react';

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

  return (
    <>
      <Helmet>
        <title>Synapse - 하나의 질문, 네 개의 지성, 최고의 결론</title>
        <meta name="description" content="4개의 최고 AI가 협력하여 당신의 질문에 대한 최적의 답변을 제공합니다. 토론이 아닌 결과로 증명하는 차세대 AI 서비스." />
      </Helmet>

      <main className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-2xl">
          
          {/* Synapse 로고 */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Brain className="w-12 h-12 text-synapse-primary" />
              <h1 className="text-7xl font-bold gradient-text">Synapse</h1>
            </div>
          </div>

          {/* 검색 폼 */}
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="최고의 답을 찾기 위한 여정을 시작하세요."
                className="synapse-textarea-enhanced text-xl py-6 px-8 pr-20 min-h-[120px] text-center resize-none w-full"
                rows={1}
                disabled={isAnalyzing}
                style={{
                  height: 'auto',
                  minHeight: '120px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.max(120, target.scrollHeight)}px`;
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
          </form>

        </div>
      </main>
    </>
  );
}
