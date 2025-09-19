import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isBusy) return;
    
    setIsBusy(true);
    try {
      // Navigate to results page with query
      navigate(`/synapse/result?query=${encodeURIComponent(query.trim())}`);
    } catch (error) {
      console.error('Navigation error:', error);
      setIsBusy(false);
    }
  };

  return (
    <>
      <main className="container">
        <div className="content-wrapper">
          <h1 className="title">Synapse</h1>
          <p className="subtitle">v3.0에게 AI 협업</p>
          <form onSubmit={handleSubmit}>
            <textarea
              ref={textareaRef}
              value={query}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="최고의 답을 찾기 위한 여정을 시작하세요."
              className="search-input"
              rows={1}
              disabled={isBusy}
            />
            {isBusy && (
              <div className="loading-indicator">
                <div className="spinner"></div>
              </div>
            )}
          </form>
        </div>
      </main>

      <style jsx global>{`
        @font-face {
          font-family: 'GmarketSans';
          font-weight: 500;
          src: url('/fonts/GmarketSansMedium.otf') format('opentype');
        }
        @font-face {
          font-family: 'GmarketSans';
          font-weight: 700;
          src: url('/fonts/GmarketSansBold.otf') format('opentype');
        }

        :root {
          --primary: #4A90E2;
          --background: #0D1117;
          --surface: #161B22;
          --text: #E6EDF3;
          --text-muted: #8B949E;
          --border: #30363D;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background-color: var(--background);
          color: var(--text);
          font-family: 'GmarketSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          line-height: 1.6;
          overflow-x: hidden;
        }

        .container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 1rem;
          background: linear-gradient(135deg, var(--background) 0%, #1a1f2e 100%);
        }

        .content-wrapper {
          width: 100%;
          max-width: 800px;
          text-align: center;
        }

        .title {
          font-size: clamp(4rem, 15vw, 9rem);
          font-weight: 700;
          color: var(--text-muted);
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, var(--text-muted), var(--primary));
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 30px rgba(74, 144, 226, 0.3);
        }

        .subtitle {
          font-size: clamp(1rem, 3vw, 1.5rem);
          font-weight: 500;
          color: var(--text-muted);
          margin-bottom: 2.5rem;
          opacity: 0.8;
        }

        .search-input {
          width: 100%;
          padding: 1.25rem 1.5rem;
          font-size: clamp(1.25rem, 4vw, 2rem);
          font-weight: 500;
          font-family: 'GmarketSans', sans-serif;
          text-align: center;
          background-color: var(--surface);
          border: 2px solid var(--border);
          border-radius: 1.5rem;
          color: var(--text);
          resize: none;
          overflow: hidden;
          line-height: 1.6;
          box-sizing: border-box;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2), 0 8px 30px rgba(0, 0, 0, 0.4);
          transform: translateY(-2px);
        }

        .search-input:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .search-input::placeholder {
          color: var(--text-muted);
          opacity: 0.7;
        }

        .loading-indicator {
          display: flex;
          justify-content: center;
          margin-top: 1rem;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 2px solid var(--border);
          border-top: 2px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Mobile optimizations */
        @media (max-width: 768px) {
          .container {
            padding: 1rem 0.5rem;
          }
          
          .title {
            margin-bottom: 0.5rem;
          }
          
          .subtitle {
            margin-bottom: 2rem;
          }
          
          .search-input {
            padding: 1rem 1.25rem;
            border-radius: 1.25rem;
          }
        }

        /* Dark mode enhancements */
        @media (prefers-color-scheme: dark) {
          .search-input {
            background-color: rgba(22, 27, 34, 0.8);
            backdrop-filter: blur(10px);
          }
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .title {
            -webkit-text-fill-color: var(--text);
            background: none;
          }
          
          .search-input {
            border-width: 3px;
          }
        }

        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .search-input {
            transition: none;
          }
          
          .spinner {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
