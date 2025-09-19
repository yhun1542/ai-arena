import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Search } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isBusy) return;
    
    setIsBusy(true);
    
    try {
      // 더미 응답 (실제 API 연동은 나중에)
      const dummyResult = {
        answer: `"${query.trim()}"에 대한 AI 분석 결과입니다. 이것은 테스트 응답입니다.`,
        timestamp: new Date().toISOString(),
        processingTime: '2.1s',
        model: 'Synapse v3.0'
      };
      
      // 결과 페이지로 이동
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
    } catch (error) {
      console.error('처리 오류:', error);
      setIsBusy(false);
    }
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

        .synapse-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
        }

        .synapse-logo {
          font-size: 4rem;
          font-weight: bold;
          margin-bottom: 1rem;
          background: linear-gradient(45deg, #00d4ff, #ff6b6b, #4ecdc4);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradient 3s ease infinite;
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .synapse-subtitle {
          font-size: 1.5rem;
          margin-bottom: 3rem;
          opacity: 0.8;
          text-align: center;
        }

        .search-container {
          width: 100%;
          max-width: 600px;
          position: relative;
        }

        .search-form {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .search-input {
          flex: 1;
          padding: 1rem 1.5rem;
          font-size: 1.1rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 50px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #00d4ff;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .search-button {
          padding: 1rem 2rem;
          background: linear-gradient(45deg, #00d4ff, #4ecdc4);
          border: none;
          border-radius: 50px;
          color: white;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .search-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 212, 255, 0.3);
        }

        .search-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .loading {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>

      <div className="synapse-container">
        <h1 className="synapse-logo">Synapse</h1>
        <p className="synapse-subtitle">AI Arena - 차세대 인공지능 플랫폼</p>
        
        <div className="search-container">
          <form onSubmit={handleSubmit} className="search-form">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="질문을 입력하세요..."
              className="search-input"
              disabled={isBusy}
            />
            <button 
              type="submit" 
              disabled={!query.trim() || isBusy}
              className={`search-button ${isBusy ? 'loading' : ''}`}
            >
              <Search size={20} />
              {isBusy ? '처리중...' : '검색'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
