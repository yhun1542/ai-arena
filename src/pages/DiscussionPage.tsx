import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Bot, Home, RefreshCw, Frown } from 'lucide-react';
import { motion } from 'framer-motion';
import LanguageSelector from '../components/LanguageSelector';

export default function DiscussionPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const userQuery = searchParams.get('q');
  const discussionId = searchParams.get('id');
  
  const [streamedContent, setStreamedContent] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleStream = useCallback(async () => {
    if (isStreaming) return;

    setIsStreaming(true);
    setStatusMessage('🔄 연결 설정 중...');
    setStreamedContent(''); // 이전 내용 초기화
    setError('');

    try {
      // 모든 리소스 요청은 상대 경로를 사용합니다.
      const response = await fetch(`/api/stream?q=${encodeURIComponent(userQuery || '')}`);
      
      if (!response.ok) {
        throw new Error(`서버 오류: ${response.status}`);
      }
      
      if (!response.body) {
        throw new Error('스트림을 지원하지 않는 응답입니다.');
      }
      
      setStatusMessage('✅ 연결이 성공적으로 설정되었습니다.');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          setStatusMessage('🎉 스트리밍이 성공적으로 완료되었습니다!');
          break;
        }
        const chunk = decoder.decode(value);
        // useState를 사용하여 화면을 안정적으로 업데이트합니다.
        setStreamedContent((prev) => prev + chunk);
      }
    } catch (error) {
      console.error('스트리밍 오류:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      setStatusMessage('🚨 스트리밍 중 오류가 발생했습니다.');
    } finally {
      setIsStreaming(false);
    }
  }, [userQuery]);

  // 페이지 로드 시 자동으로 스트리밍 시작
  useEffect(() => {
    if (userQuery && discussionId) {
      handleStream();
    }
  }, [userQuery, discussionId, handleStream]);

  const handleRetry = () => {
    handleStream();
  };

  const goBack = () => {
    window.history.back();
  };

  return (
    <>
      <Helmet>
        <title>토론 진행 중 | {t('pageTitle')}</title>
        <meta name="description" content={`${userQuery}에 대한 AI 팀의 응답`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8 font-sans">
        {/* 언어 선택기 */}
        <div className="absolute top-4 right-4">
          <LanguageSelector />
        </div>

        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <motion.h1 
              className="text-4xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-amber-400"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              AI Arena Discussion
            </motion.h1>
            <motion.p 
              className="text-lg text-gray-400 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              "{userQuery}"
            </motion.p>
            <p className="text-sm text-gray-500 mt-1">세션: {discussionId?.slice(0, 8)}...</p>
          </header>

          <main className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="">
                  <CardTitle className="flex items-center space-x-2 text-blue-400">
                    <Bot className="h-5 w-5" />
                    <span>{t('discussionTitle')}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="">
                  <div className="space-y-4">
                    {/* 상태 표시 */}
                    <div className="flex items-center space-x-2">
                      {isStreaming && <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />}
                      <span className="text-sm text-gray-300">
                        {statusMessage === 'connected' ? 'AI가 응답을 준비하고 있습니다...' : 
                         statusMessage === 'streamCompleted' ? 'AI 응답이 완료되었습니다' : 
                         statusMessage === 'streamError' ? '응답 중 오류가 발생했습니다' : 
                         statusMessage}
                      </span>
                    </div>

                    {/* 에러 메시지 */}
                    {error && (
                      <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <Frown className="h-5 w-5 text-red-400" />
                          <span className="text-red-400">{error}</span>
                        </div>
                      </div>
                    )}

                    {/* 스트리밍 콘텐츠 */}
                    {streamedContent && (
                      <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                        <pre className="whitespace-pre-wrap text-sm text-gray-100 font-mono leading-relaxed">
                          {streamedContent}
                        </pre>
                      </div>
                    )}

                    {/* 빈 상태일 때 안내 메시지 */}
                    {!streamedContent && !isStreaming && !error && (
                      <div className="text-center py-8 text-gray-400">
                        <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>AI 팀의 응답을 기다리고 있습니다...</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex space-x-2">
                  <Button 
                    onClick={goBack} 
                    variant="outline" 
                    size="default"
                    className="flex items-center space-x-2"
                  >
                    <Home className="h-4 w-4" />
                    <span>{t('back')}</span>
                  </Button>
                  <Button 
                    onClick={handleRetry} 
                    disabled={isStreaming}
                    variant="default"
                    size="default"
                    className="flex items-center space-x-2"
                  >
                    <RefreshCw className={`h-4 w-4 ${isStreaming ? 'animate-spin' : ''}`} />
                    <span>{isStreaming ? '응답 받는 중...' : '응답 받기'}</span>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
}
