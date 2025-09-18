import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DiscussionPage from './pages/DiscussionPage';
import './App.css';
import { LoaderCircle, Search } from 'lucide-react';

function HomePage() {
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleStartDiscussion = async () => {
    if (!query.trim()) {
      setError('토론할 주제를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. 백엔드에 토론 생성을 요청하여 고유 ID를 받습니다.
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || '토론을 생성할 수 없습니다.');
      }

      const { discussionId } = data;
      if (!discussionId) {
        throw new Error('고유 토론 ID를 받지 못했습니다.');
      }

      // 2. UX 개선: 받은 ID와 사용자의 질문(query)을 URL에 담아 토론 페이지로 이동시킵니다.
      navigate(`/discussion?id=${discussionId}&q=${encodeURIComponent(query.trim())}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleStartDiscussion();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
      <main className="flex flex-col justify-center items-center text-center w-full max-w-2xl">
        <header className="mb-10">
          <h1 className="text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-amber-400">
            AI Arena
          </h1>
          <p className="text-xl text-gray-400 mt-2">AI 검투사들의 지적 대결</p>
        </header>

        <div className="w-full max-w-md space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="토론할 주제를 입력하세요..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-12 pr-4 py-6 text-lg rounded-full border-2 bg-gray-800 border-gray-700 focus:border-blue-500 focus:outline-none ring-offset-gray-900"
              disabled={isLoading}
            />
          </div>
          
          <Button 
            onClick={handleStartDiscussion}
            className="w-full py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-transform duration-200 ease-in-out hover:scale-105 disabled:opacity-50"
            disabled={!query.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <LoaderCircle className="animate-spin -ml-1 mr-3 h-5 w-5" />
                아레나 준비 중...
              </>
            ) : (
              '챔피언십 시작'
            )}
          </Button>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/discussion" element={<DiscussionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
