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
          <form onSubmit={handleSubmit}>
            <textarea
              ref={textareaRef}
              value={query}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="최고의 답을 찾기 위한 여정을 시작하세요."
              className="search-input"
              rows={1}
            />
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
        }
        
        body {
          background-color: var(--background);
          color: var(--text);
          font-family: 'GmarketSans', sans-serif;
        }
        
        .container {
          display: flex; 
          align-items: center; 
          justify-content: center;
          min-height: 100vh; 
          padding: 1rem;
        }
        
        .content-wrapper { 
          width: 100%; 
          max-width: 800px; 
        }
        
        .title {
          font-size: clamp(4rem, 15vw, 9rem); 
          font-weight: 700;
          text-align: center; 
          color: var(--text-muted); 
          margin-bottom: 2.5rem;
        }
        
        .search-input {
          width: 100%; 
          padding: 1.25rem;
          font-size: clamp(1.25rem, 4vw, 2rem); 
          font-weight: 500;
          text-align: center; 
          background-color: var(--surface);
          border: 2px solid var(--text-muted); 
          border-radius: 1.5rem;
          color: var(--text); 
          resize: none; 
          overflow: hidden;
          line-height: 1.6; 
          box-sizing: border-box;
          transition: height 0.2s ease, border-color 0.2s ease;
        }
        
        .search-input:focus { 
          outline: none; 
          border-color: var(--primary); 
        }
      `}</style>
    </>
  );
}
