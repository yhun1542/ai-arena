import { useState } from 'react';
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
      const response = await fetch('/api/synapse-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });
      
      if (response.ok) {
        const result = await response.json();
        navigate('/synapse/result', { 
          state: { 
            result: result.answer, 
            query: query.trim(),
            metadata: {
              timestamp: result.timestamp,
              processingTime: result.processingTime,
              model: result.model
            }
          } 
        });
      } else {
        console.error('API 호출 실패:', response.status);
        setIsBusy(false);
      }
    } catch (error) {
      console.error('API 오류:', error);
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
              placeholder="최고의 답을 찾기 위한 여정을 시작하세요..."
              className="search-input"
              disabled={isBusy}
            />
            <button type="submit" disabled={isBusy || !query.trim()} className="search-button">
              <Search size={24} />
            </button>
          </form>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2108@1.1/GmarketSans.css');
        
        :root {
          --primary: #4A90E2;
          --background: #0D1117;
          --surface: #161B22;
          --text: #E6EDF3;
          --text-muted: #8B949E;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          background-color: var(--background);
          color: var(--text);
          font-family: 'GmarketSans', sans-serif;
          min-height: 100vh;
        }

        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
        }
        
        .contentWrapper {
          width: 100%;
          max-width: 600px;
          text-align: center;
        }
        
        .title {
          font-size: clamp(4rem, 12vw, 8rem);
          font-weight: 700;
          background: linear-gradient(135deg, #4A90E2, #9B59B6, #E91E63);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 3rem;
          letter-spacing: -0.02em;
        }
        
        .search-bar {
          position: relative;
          width: 100%;
        }
        
        .search-input {
          width: 100%;
          height: 60px;
          padding: 0 70px 0 24px;
          border: 2px solid var(--text-muted);
          border-radius: 30px;
          font-size: 1.1rem;
          background-color: var(--surface);
          color: var(--text);
          transition: all 0.3s ease;
          font-family: 'GmarketSans', sans-serif;
        }
        
        .search-input::placeholder {
          color: var(--text-muted);
        }
        
        .search-input:hover,
        .search-input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 20px rgba(74, 144, 226, 0.3);
          outline: none;
        }
        
        .search-input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .search-button {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          background: var(--primary);
          border: none;
          border-radius: 22px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.3s ease;
        }
        
        .search-button:hover:not(:disabled) {
          background: #357ABD;
          transform: translateY(-50%) scale(1.05);
        }
        
        .search-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: translateY(-50%);
        }
        
        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
          
          .title {
            margin-bottom: 2rem;
          }
          
          .search-input {
            height: 50px;
            font-size: 1rem;
            padding: 0 60px 0 20px;
          }
          
          .search-button {
            width: 36px;
            height: 36px;
            border-radius: 18px;
          }
        }
      `}</style>
    </>
  );
}
