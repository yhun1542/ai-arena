import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'

function DiscussionPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const discussionId = searchParams.get('id')
  
  const [streamContent, setStreamContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!discussionId) {
      navigate('/')
      return
    }
  }, [discussionId, navigate])

  const handleStartStream = async () => {
    setIsStreaming(true)
    setError('')
    setStreamContent('')

    try {
      const response = await fetch('/api/stream', {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('스트리밍을 지원하지 않는 브라우저입니다.')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        
        // 줄바꿈으로 구분된 청크들 처리
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 마지막 불완전한 줄은 버퍼에 보관

        for (const line of lines) {
          if (line.trim()) {
            setStreamContent(prev => prev + line + '\n')
            // 각 청크마다 약간의 지연 효과
            await new Promise(resolve => setTimeout(resolve, 100))
          }
        }
      }

      // 남은 버퍼 내용 처리
      if (buffer.trim()) {
        setStreamContent(prev => prev + buffer)
      }

    } catch (error) {
      console.error('스트리밍 오류:', error)
      setError(error.message || '스트리밍 중 오류가 발생했습니다.')
    } finally {
      setIsStreaming(false)
    }
  }

  const handleBackToHome = () => {
    navigate('/')
  }

  if (!discussionId) {
    return null // useEffect에서 리다이렉트 처리
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Arena</h1>
              <p className="text-gray-600 mt-1">토론 ID: {discussionId}</p>
            </div>
            <Button 
              onClick={handleBackToHome}
              variant="outline"
              className="px-6 py-2"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </header>

        {/* 토론 영역 */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">AI 응답</h2>
            
            {/* 스트리밍 컨트롤 */}
            <div className="mb-4">
              <Button 
                onClick={handleStartStream}
                disabled={isStreaming}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
              >
                {isStreaming ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    스트리밍 중...
                  </span>
                ) : (
                  'AI 응답 받기'
                )}
              </Button>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm" role="alert">{error}</p>
              </div>
            )}

            {/* 스트리밍 콘텐츠 */}
            <div className="min-h-[200px] p-4 bg-gray-50 rounded-md border">
              {streamContent ? (
                <pre className="whitespace-pre-wrap text-gray-800 font-mono text-sm leading-relaxed">
                  {streamContent}
                </pre>
              ) : (
                <p className="text-gray-500 italic">
                  {isStreaming ? '응답을 받고 있습니다...' : 'AI 응답 받기 버튼을 클릭하여 시작하세요.'}
                </p>
              )}
              
              {/* 스트리밍 중 커서 효과 */}
              {isStreaming && (
                <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1"></span>
              )}
            </div>
          </div>

          {/* 토론 정보 */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">토론 정보</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>토론 ID:</strong> {discussionId}</p>
              <p><strong>생성 시간:</strong> {new Date().toLocaleString('ko-KR')}</p>
              <p><strong>상태:</strong> {isStreaming ? '진행 중' : '대기 중'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiscussionPage
