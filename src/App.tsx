import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DiscussionPage from './pages/DiscussionPage';
import './App.css';

function HomePage() {
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleStartDiscussion = async () => {
    // ... (이전과 동일한 토론 시작 함수 내용) ...
    if (!query.trim()) {
      setError('질문을 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      navigate(`/discussion?id=${data.discussionId}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError('토론을 시작할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
      <main className="flex flex-col justify-center items-center text-center max-w-2xl mx-auto px-4">
        <header className="mb-10">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">AI Arena</h1>
          <p className="text-xl text-gray-600">AI와 함께하는 토론의 장</p>
        </header>
        <div className="w-full max-w-md space-y-4">
          <Input
            type="text"
            placeholder="무엇이 궁금하신가요?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleStartDiscussion} disabled={!query.trim() || isLoading}>
            {isLoading ? '토론 준비 중...' : '토론 시작'}
          </Button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
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
