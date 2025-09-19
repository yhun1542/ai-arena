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
          <form onSubmit={handleSubmit} className="form">
            <div className="inputWrapper">
              <Search className="searchIcon" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="최고의 답을 찾기 위한 여정을 시작하세요."
                className="searchInput"
              />
            </div>
            <button type="submit" disabled={isBusy} className="searchButton">
              {isBusy ? '분석 중...' : '결론 도출'}
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
        }
        .contentWrapper {
          width: 100%;
          max-width: 800px;
          text-align: center;
        }
        .title {
          font-size: clamp(4rem, 15vw, 9rem);
          font-weight: 700;
          color: var(--text-muted);
          margin-bottom: 2.5rem;
        }
        .form {
          width: 100%;
        }
        .inputWrapper {
          position: relative;
          width: 100%;
        }
        .searchInput {
          width: 100%;
          padding: 1.25rem 1.5rem 1.25rem 3.5rem; /* Left padding for icon */
          font-size: clamp(1.1rem, 4vw, 1.5rem);
          background-color: var(--surface);
          border: 2px solid var(--text-muted);
          border-radius: 1.5rem;
          color: var(--text);
          box-sizing: border-box;
        }
        .searchIcon {
          position: absolute;
          left: 1.25rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }
        .searchButton {
          margin-top: 1rem;
          width: 100%;
          padding: 1rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: white;
          background-color: var(--primary);
          border: none;
          border-radius: 1.25rem;
          cursor: pointer;
        }
        .searchButton:disabled {
          opacity: 0.5;
        }
      `}</style>
    </>
  );
}
