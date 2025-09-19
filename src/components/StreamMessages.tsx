import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, ThumbsUp, User, Bot } from 'lucide-react';

interface StreamMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'ai' | 'system';
}

interface StreamMessagesProps {
  messages: StreamMessage[];
  isLoading?: boolean;
}

export const StreamMessages: React.FC<StreamMessagesProps> = ({ 
  messages, 
  isLoading = false 
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopy = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleLike = (messageId: string) => {
    setLikedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 md:p-6 max-w-4xl mx-auto">
      <AnimatePresence>
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} w-full`}
          >
            <div 
              className={`
                flex flex-col max-w-[85%] sm:max-w-[75%] md:max-w-[65%] rounded-2xl shadow-lg
                ${message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : message.type === 'ai'
                  ? 'bg-gray-800 text-gray-100 border border-gray-700'
                  : 'bg-yellow-600 text-white'
                }
              `}
            >
              {/* 메시지 헤더 */}
              <div className={`flex items-center space-x-2 px-4 py-2 border-b ${
                message.type === 'user' 
                  ? 'border-blue-500' 
                  : message.type === 'ai'
                  ? 'border-gray-600'
                  : 'border-yellow-500'
              }`}>
                {message.type === 'user' ? (
                  <User size={16} />
                ) : message.type === 'ai' ? (
                  <Bot size={16} />
                ) : (
                  <div className="w-4 h-4 bg-yellow-400 rounded-full" />
                )}
                <span className="text-sm font-medium opacity-90">
                  {message.type === 'user' ? '사용자' : message.type === 'ai' ? 'AI 어시스턴트' : '시스템'}
                </span>
                <span className="text-xs opacity-70 ml-auto">
                  {message.timestamp.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>

              {/* 메시지 내용 - 동적 타이포그래피 */}
              <div className="px-4 py-3 sm:py-4">
                <div className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </div>
              </div>

              {/* AI 메시지 액션 버튼 - 터치 영역 확대 */}
              {message.type === 'ai' && (
                <div className="flex items-center justify-end space-x-2 px-4 py-3 border-t border-gray-600">
                  <button 
                    onClick={() => handleCopy(message.id, message.content)}
                    className="flex items-center space-x-1 px-3 py-2 min-h-[36px] text-sm bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                    aria-label="메시지 복사"
                  >
                    <Copy size={14} />
                    <span className="hidden sm:inline">
                      {copiedId === message.id ? '복사됨!' : '복사'}
                    </span>
                  </button>
                  
                  <button 
                    onClick={() => handleLike(message.id)}
                    className={`flex items-center space-x-1 px-3 py-2 min-h-[36px] text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                      likedIds.has(message.id)
                        ? 'bg-blue-600 text-white focus:ring-blue-500'
                        : 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-gray-300 focus:ring-gray-500'
                    }`}
                    aria-label="좋아요"
                  >
                    <ThumbsUp size={14} className={likedIds.has(message.id) ? 'fill-current' : ''} />
                    <span className="hidden sm:inline">
                      {likedIds.has(message.id) ? '좋아요!' : '좋아요'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* 로딩 인디케이터 */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-start"
        >
          <div className="flex flex-col max-w-[85%] sm:max-w-[75%] md:max-w-[65%] bg-gray-800 border border-gray-700 rounded-2xl shadow-lg">
            <div className="flex items-center space-x-2 px-4 py-2 border-b border-gray-600">
              <Bot size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-400">AI 어시스턴트</span>
            </div>
            
            <div className="px-4 py-4">
              <div className="flex items-center space-x-2">
                <div className="typing-indicator flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 1.2, 
                        repeat: Infinity, 
                        delay: i * 0.2 
                      }}
                      className="w-2 h-2 bg-gray-400 rounded-full"
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400 ml-2">응답 생성 중...</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* 스크롤 앵커 */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default StreamMessages;
