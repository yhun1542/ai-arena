import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Search } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isBusy) return;
    
    setIsBusy(true);
    
    try {
      // 실제 API 호출
      const response = await fetch('/api/synapse-mega', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          models: ['gpt-4o', 'gemini-2.0-flash-exp', 'claude-3-5-sonnet-20241022'],
          mode: 'parallel'
        }),
      });

      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }

      const result = await response.json();
      
      // 결과를 sessionStorage에 저장
      sessionStorage.setItem('synapseResult', JSON.stringify({
        query: query.trim(),
        result: result,
        timestamp: new Date().toISOString()
      }));
      
      // 결과 페이지로 이동
      router.push('/synapse/result');
      
    } catch (error) {
      console.error('검색 오류:', error);
      // 오류 발생 시 더미 응답으로 대체
      const dummyResult = {
        answer: `"${query.trim()}"에 대한 답변을 준비 중입니다. AI Arena의 메가 오케스트레이션 시스템이 곧 완성될 예정입니다!`,
        timestamp: new Date().toISOString(),
        processingTime: '2.1s',
        model: 'Synapse v3.0'
      };
      
      sessionStorage.setItem('synapseResult', JSON.stringify({
        result: dummyResult.answer, 
        query: query.trim(),
        metadata: {
          timestamp: dummyResult.timestamp,
          processingTime: dummyResult.processingTime,
          model: dummyResult.model
        }
      }));
      router.push('/synapse/result');
    }
    
    setIsBusy(false);
  };

  return (
    <>
      <style jsx global>{`
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
          overflow-x: hidden;
        }

        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
          position: relative;
        }

        .contentWrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 600px;
          width: 100%;
          text-align: center;
        }

        .title {
          font-size: 4rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 2rem;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .search-bar {
          position: relative;
          width: 100%;
          max-width: 500px;
          margin-bottom: 2rem;
        }

        .search-input {
          width: 100%;
          padding: 16px 60px 16px 20px;
          font-size: 16px;
          font-family: 'GmarketSans', sans-serif;
          background: rgba(255, 255, 255, 0.1);
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          color: white;
          outline: none;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .search-input:hover,
        .search-input:focus {
          border-color: #667eea;
          box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
          background: rgba(255, 255, 255, 0.15);
        }

        .search-button {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }

        .search-button:hover {
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .search-button:active {
          transform: translateY(-50%) scale(0.95);
        }

        .search-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: translateY(-50%);
        }

        .loading {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .title {
            font-size: 3rem;
          }
          
          .search-input {
            font-size: 14px;
            padding: 14px 55px 14px 18px;
          }
          
          .search-button {
            width: 36px;
            height: 36px;
          }
        }

        @media (max-width: 480px) {
          .title {
            font-size: 2.5rem;
          }
          
          .contentWrapper {
            padding: 0 10px;
          }
        }
      `}</style>

      <main className="container">
        <div className="contentWrapper">
          <h1 className="title">Synapse</h1>
          <form onSubmit={handleSubmit} className="search-bar">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="최고의 답을 찾기 위한 여정을 시작하세요..."
              className="search-input"
              disabled={isBusy}
            />
            <button 
              type="submit" 
              className="search-button"
              disabled={isBusy || !query.trim()}
            >
              <Search 
                size={20} 
                className={isBusy ? 'loading' : ''} 
              />
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
