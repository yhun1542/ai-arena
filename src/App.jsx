import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import './App.css'

function App() {
  const [query, setQuery] = useState('')

  const handleStartDiscussion = () => {
    if (query.trim()) {
      console.log('토론 시작:', query)
      // 여기에 토론 시작 로직 추가
    }
  }

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
            className="w-full px-6 py-4 text-lg rounded-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-center"
            onKeyPress={(e) => e.key === 'Enter' && handleStartDiscussion()}
          />
          <Button 
            onClick={handleStartDiscussion}
            className="w-full py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
            disabled={!query.trim()}
          >
            토론 시작
          </Button>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>AI와 함께 다양한 주제로 토론해보세요</p>
        </div>
      </main>
    </div>
  )
}

export default App
