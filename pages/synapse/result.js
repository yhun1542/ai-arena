import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Clock, Award, AlertCircle } from 'lucide-react';

export default function SynapseResultPage() {
  const router = useRouter();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = sessionStorage.getItem('synapseResult');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setResultData(parsed);
      } catch (error) {
        console.error('결과 데이터 파싱 오류:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleNewSearch = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl mb-4">결과를 찾을 수 없습니다</h2>
          <button 
            onClick={handleNewSearch}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            새 검색하기
          </button>
        </div>
      </div>
    );
  }

  const { query, result, timestamp } = resultData;
  const responses = result?.data?.responses || result?.responses || [];
  const orchestration = result?.data?.orchestration || result?.orchestration || {};

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2108@1.1/GmarketSans.css');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: 'GmarketSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            color: white;
            min-height: 100vh;
          }

          .container {
            min-height: 100vh;
            padding: 20px;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .title {
            font-size: 2rem;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .new-search-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 25px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .new-search-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
          }

          .query-section {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 25px;
            margin-bottom: 30px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .query-title {
            font-size: 1.2rem;
            color: #64b5f6;
            margin-bottom: 15px;
            font-weight: 600;
          }

          .query-text {
            font-size: 1.1rem;
            line-height: 1.6;
          }

          .responses-grid {
            display: grid;
            gap: 20px;
            margin-bottom: 30px;
          }

          .response-card {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
          }

          .response-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          }

          .model-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 15px;
          }

          .model-info {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .model-icon {
            font-size: 1.5rem;
          }

          .model-name {
            font-size: 1.2rem;
            font-weight: 600;
          }

          .model-provider {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.7);
          }

          .score-badge {
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 6px 12px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
          }

          .error-badge {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          }

          .response-content {
            line-height: 1.6;
            margin-bottom: 15px;
          }

          .response-meta {
            display: flex;
            gap: 20px;
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.7);
          }

          .meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }

          .summary-section {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 15px;
            padding: 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .summary-title {
            font-size: 1.3rem;
            margin-bottom: 15px;
            color: #f093fb;
            font-weight: 600;
          }

          .processing-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
          }

          .info-item {
            text-align: center;
            padding: 15px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 10px;
          }

          .info-label {
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.7);
            margin-bottom: 5px;
          }

          .info-value {
            font-size: 1.1rem;
            font-weight: 600;
          }

          @media (max-width: 768px) {
            .header {
              flex-direction: column;
              gap: 15px;
              text-align: center;
            }
            
            .title {
              font-size: 1.5rem;
            }
            
            .processing-info {
              grid-template-columns: 1fr;
            }
          }
        `
      }} />

      <div className="container">
        <div className="header">
          <h1 className="title">Synapse 결과</h1>
          <button onClick={handleNewSearch} className="new-search-btn">
            <ArrowLeft size={20} />
            새 검색
          </button>
        </div>

        <div className="query-section">
          <div className="query-title">질문</div>
          <div className="query-text">{query}</div>
        </div>

        <div className="responses-grid">
          {responses.map((item, index) => {
            const model = item.model || {};
            const response = item.response || {};
            const isError = response.content?.includes('오류') || response.content?.includes('실패') || response.score === 0;
            
            return (
              <div key={index} className="response-card">
                <div className="model-header">
                  <div className="model-info">
                    <span className="model-icon">{model.icon || '🤖'}</span>
                    <div>
                      <div className="model-name">{model.name || '알 수 없음'}</div>
                      <div className="model-provider">{model.provider || ''}</div>
                    </div>
                  </div>
                  <div className={`score-badge ${isError ? 'error-badge' : ''}`}>
                    {isError ? (
                      <>
                        <AlertCircle size={16} />
                        오류
                      </>
                    ) : (
                      <>
                        <Award size={16} />
                        {response.score || 0}점
                      </>
                    )}
                  </div>
                </div>
                
                <div className="response-content">
                  {response.content || '응답 없음'}
                </div>
                
                <div className="response-meta">
                  <div className="meta-item">
                    <Clock size={14} />
                    {response.processingTime || 0}ms
                  </div>
                  <div className="meta-item">
                    신뢰도: {response.confidence || 0}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="summary-section">
          <div className="summary-title">처리 요약</div>
          <div className="processing-info">
            <div className="info-item">
              <div className="info-label">처리 시간</div>
              <div className="info-value">{orchestration.processingTime || '알 수 없음'}</div>
            </div>
            <div className="info-item">
              <div className="info-label">성공한 응답</div>
              <div className="info-value">{orchestration.successfulResponses || 0}개</div>
            </div>
            <div className="info-item">
              <div className="info-label">평균 점수</div>
              <div className="info-value">{orchestration.averageScore || 0}점</div>
            </div>
            <div className="info-item">
              <div className="info-label">처리 시각</div>
              <div className="info-value">
                {timestamp ? new Date(timestamp).toLocaleString('ko-KR') : '알 수 없음'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
