import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isBusy) return;
    
    setIsBusy(true);
    try {
      // Navigate to results page with query
      // API 호출 테스트
      const response = await fetch('/api/synapse-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });
      
      if (response.ok) {
        const result = await response.json();
        navigate('/synapse/result', { state: { result: result.data, query: query.trim() } });
      } else {
        throw new Error('API 호출 실패');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      setIsBusy(false);
    }
  };

  return (
    <>
      <main className="container">
        <div className="contentWrapper">
          <h1 className="title">Synapse</h1>
          <form onSubmit={handleSubmit} className="search-bar">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색어를 입력하세요..."
              className="search-input"
            />
            <button type="submit" disabled={isBusy} className="search-button">
              <Search size={24} />
            </button>
          </form>
        </div>
      </main>

      <style jsx global>{`
        /* Global styles like fonts and colors remain the same */
        @import url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2108@1.1/GmarketSans.css');
        :root {
          --primary: #4A90E2; --background: #0D1117; --surface: #161B22;
          --text: #E6EDF3; --text-muted: #8B949E;
        }
        body {
          background-color: var(--background);
          color: var(--text);
          font-family: 'GmarketSans', sans-serif;
        }

        /* Layout Fixes */
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 1rem;
          margin-top: 5vh;
        }
        .contentWrapper {
          width: 100%;
          max-width: 500px;
          text-align: center;
        }
        .title {
          font-size: clamp(4rem, 15vw, 9rem);
          font-weight: 700;
          background: linear-gradient(135deg, #4A90E2, #9B59B6, #E91E63);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 25px;
        }
        
        /* 검색창과 아이콘을 함께 묶는 영역 */
        .search-bar {
          position: relative;
          width: 100%;
          max-width: 500px;
        }
        
        /* 실제 텍스트를 입력하는 검색창 */
        .search-input {
          width: 100%;
          height: 50px;
          padding: 0 60px 0 20px;
          border: 2px solid var(--text-muted);
          border-radius: 25px;
          font-size: 1rem;
          background-color: var(--surface);
          color: var(--text);
          box-sizing: border-box;
          transition: all 0.3s ease;
        }
        
        /* 검색창 호버 및 포커스 효과 */
        .search-input:hover,
        .search-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 10px rgba(74, 144, 226, 0.3);
          outline: none;
        }
        
        /* 돋보기 아이콘 버튼 */
        .search-button {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          transition: color 0.3s ease;
        }
        
        .search-button:hover {
          color: var(--primary);
        }
        
        .search-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}
/* Force rebuild Fri Sep 19 08:57:04 EDT 2025 */
