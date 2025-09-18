import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import DiscussionPage from './pages/DiscussionPage.jsx'
import LanguageSelector from './components/LanguageSelector.jsx'
import './i18n' // i18n 설정 로드
import './App.css'

function HomePage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()



  const handleStartDiscussion = async () => {
    if (!query.trim()) {
      setError(t('invalidInput'))
      return
    }

    if (query.length > 20000) {
      setError('질문은 20,000자를 초과할 수 없습니다.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      
      // Location 헤더에서 URL 추출하거나 discussionId 사용
      const locationHeader = response.headers.get('Location')
      if (locationHeader) {
        navigate(locationHeader)
      } else if (data.discussionId) {
        navigate(`/discussion?id=${data.discussionId}`)
      } else {
        throw new Error('토론 ID를 받지 못했습니다.')
      }

    } catch (error) {
      console.error('토론 시작 오류:', error)
      setError(error.message || t('networkError'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleStartDiscussion()
    }
  }

  return (
    <>
      <Helmet>
        <title>{t('pageTitle')}</title>
        <meta name="description" content={t('subheadline')} />
        <meta property="og:title" content={t('pageTitle')} />
        <meta property="og:description" content={t('subheadline')} />
        <meta name="twitter:title" content={t('pageTitle')} />
        <meta name="twitter:description" content={t('subheadline')} />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        {/* 언어 선택기 */}
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>
      
      <main className="flex flex-col justify-center items-center text-center max-w-2xl mx-auto px-4">
        <header className="mb-10">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">AI Arena</h1>
          <h2 className="headline text-2xl font-semibold text-gray-800 mb-4">{t('headline')}</h2>
          <p className="text-lg text-gray-600">{t('subheadline')}</p>
        </header>

        <div className="w-full max-w-md space-y-4">
          <div className="space-y-2">
            <Input
              id="q"
              type="text"
              placeholder={t('placeholder')}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                if (error) setError('') // 입력 시 에러 메시지 제거
              }}
              onKeyPress={handleKeyPress}
              maxLength={20000}
              className="w-full px-6 py-4 text-lg rounded-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-center"
              disabled={isLoading}
              aria-busy={isLoading}
              aria-describedby={error ? "error-message" : undefined}
            />
            {error && (
              <p id="error-message" className="text-red-500 text-sm text-center" role="alert">
                {error}
              </p>
            )}
          </div>
          
          <Button 
            onClick={handleStartDiscussion}
            className="w-full py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!query.trim() || isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('button_starting')}
              </span>
            ) : (
              t('button_start')
            )}
          </Button>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>{t('subheadline')}</p>
          {isLoading && (
            <p className="mt-2" role="status" aria-live="polite">
              {t('button_starting')}
            </p>
          )}
        </div>
      </main>
    </div>
    </>
  )
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/discussion" element={<DiscussionPage />} />
        </Routes>
      </Router>
    </HelmetProvider>
  )
}

export default App
