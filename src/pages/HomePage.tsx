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
        <div className="w-full flex flex-col items-center">
          
          {/* Synapse 로고 - 뇌 아이콘을 오른쪽 위로 */}
          <div className="text-center mb-16">
            <div className="relative inline-block">
              <h1 className="font-bold gradient-text" style={{ fontSize: '12rem', lineHeight: '1' }}>Synapse</h1>
              <Brain className="absolute -top-4 -right-8 w-32 h-32 text-synapse-primary" />
            </div>
          </div>

          {/* 검색 폼 - 한 줄 검색창으로 축소 */}
          <form onSubmit={handleSubmit} className="mb-8 w-full max-w-4xl px-8">
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="최고의 답을 찾기 위한 여정을 시작하세요."
                className="synapse-input-enhanced text-3xl py-4 px-6 pr-16 w-full text-center"
                disabled={isAnalyzing}
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
