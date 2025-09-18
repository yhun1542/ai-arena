import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  speaker: string;
  content: string;
  timestamp: Date;
}

export default function DiscussionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string>('');
  
  const discussionId = searchParams.get('id');
  const query = searchParams.get('query') || '인공지능이 인간의 일자리를 대체할 것이라는 주장에 대해 어떻게 생각하나요?';

  useEffect(() => {
    if (!discussionId) {
      navigate('/');
      return;
    }
    
    startAIDiscussion();
  }, [discussionId, navigate]);

  const startAIDiscussion = async () => {
    setIsStreaming(true);
    setError('');
    setMessages([]);

    try {
      const response = await fetch('/api/stream', {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('스트림을 읽을 수 없습니다.');
      }

      let currentMessage = '';
      let currentSpeaker = '';
      let messageId = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        
        // 새로운 화자 감지
        const speakerMatch = chunk.match(/\*\*\[([^\]]+)\]\*\*/);
        if (speakerMatch) {
          // 이전 메시지가 있다면 저장
          if (currentMessage.trim() && currentSpeaker) {
            setMessages(prev => [...prev, {
              id: messageId,
              speaker: currentSpeaker,
              content: currentMessage.trim(),
              timestamp: new Date()
            }]);
          }
          
          // 새로운 화자 설정
          currentSpeaker = speakerMatch[1];
          currentMessage = '';
          messageId = `msg-${Date.now()}-${Math.random()}`;
          continue;
        }

        // 일반 텍스트 누적
        if (currentSpeaker && !chunk.includes('--- 토론 종료 ---')) {
          currentMessage += chunk;
          
          // 실시간으로 현재 메시지 업데이트
          setMessages(prev => {
            const filtered = prev.filter(msg => msg.id !== messageId);
            return [...filtered, {
              id: messageId,
              speaker: currentSpeaker,
              content: currentMessage.trim(),
              timestamp: new Date()
            }];
          });
        }
      }

      // 마지막 메시지 처리
      if (currentMessage.trim() && currentSpeaker) {
        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== messageId);
          return [...filtered, {
            id: messageId,
            speaker: currentSpeaker,
            content: currentMessage.trim(),
            timestamp: new Date()
          }];
        });
      }

    } catch (err) {
      console.error('스트리밍 오류:', err);
      setError('AI 토론을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleNewDiscussion = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Arena 토론</h1>
              <p className="text-gray-600">주제: {query}</p>
            </div>
            <Button 
              onClick={handleNewDiscussion}
              variant="outline"
              className="px-6 py-2"
            >
              새 토론 시작
            </Button>
          </div>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <Button 
              onClick={startAIDiscussion}
              className="mt-2"
              size="sm"
            >
              다시 시도
            </Button>
          </div>
        )}

        {/* 토론 내용 */}
        <div className="space-y-6">
          {messages.length === 0 && !isStreaming && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500">토론을 시작하려면 새로고침하세요.</p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-blue-600">
                  {message.speaker}
                </h3>
                <span className="text-sm text-gray-500">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {/* 스트리밍 인디케이터 */}
          {isStreaming && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">AI가 토론 중입니다...</span>
              </div>
            </div>
          )}
        </div>

        {/* 토론 완료 후 액션 */}
        {!isStreaming && messages.length > 0 && !error && (
          <div className="mt-8 text-center">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">토론 완료!</h3>
              <p className="text-green-600">
                두 AI가 "{query}" 주제에 대한 토론을 마쳤습니다.
              </p>
            </div>
            <Button 
              onClick={handleNewDiscussion}
              className="px-8 py-3 text-lg"
            >
              새로운 주제로 토론하기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
