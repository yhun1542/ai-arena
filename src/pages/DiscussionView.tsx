import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import StreamMessages from '../components/StreamMessages';

interface Discussion {
  id: string;
  title: string;
  participants: string[];
  messages: Array<{
    id: string;
    content: string;
    timestamp: Date;
    type: 'user' | 'ai' | 'system';
  }>;
  status: 'active' | 'completed' | 'paused';
}

const DiscussionView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const discussionId = searchParams.get('id');
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    if (discussionId) {
      // Mock discussion data
      setDiscussion({
        id: discussionId,
        title: 'AI와 함께하는 토론: 인공지능의 미래',
        participants: ['사용자', 'AI Assistant'],
        messages: [
          {
            id: 'msg-1',
            content: '인공지능이 인간의 일자리를 대체할까요?',
            timestamp: new Date(Date.now() - 300000),
            type: 'user'
          },
          {
            id: 'msg-2',
            content: '흥미로운 질문이네요. AI는 일부 직업을 자동화할 수 있지만, 동시에 새로운 기회도 창출합니다. 역사적으로 기술 발전은 항상 일자리의 변화를 가져왔지만, 전체적으로는 더 많은 가치를 창출해왔습니다.',
            timestamp: new Date(Date.now() - 240000),
            type: 'ai'
          },
          {
            id: 'msg-3',
            content: '그렇다면 우리는 어떻게 준비해야 할까요?',
            timestamp: new Date(Date.now() - 180000),
            type: 'user'
          }
        ],
        status: 'active'
      });
      setLoading(false);
    }
  }, [discussionId]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !discussion) return;

    const userMessage = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      timestamp: new Date(),
      type: 'user' as const
    };

    setDiscussion(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage]
    } : null);

    setNewMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: `msg-${Date.now()}-ai`,
        content: '좋은 질문입니다. 지속적인 학습과 적응이 핵심이라고 생각합니다.',
        timestamp: new Date(),
        type: 'ai' as const
      };

      setDiscussion(prev => prev ? {
        ...prev,
        messages: [...prev.messages, aiMessage]
      } : null);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="discussion-loading">
        <div className="loading-spinner">토론을 불러오는 중...</div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="discussion-error">
        <h2>토론을 찾을 수 없습니다</h2>
        <p>요청하신 토론이 존재하지 않거나 삭제되었습니다.</p>
      </div>
    );
  }

  return (
    <div className="discussion-view">
      <header className="discussion-header">
        <h1>{discussion.title}</h1>
        <div className="discussion-meta">
          <span className="participants">
            참여자: {discussion.participants.join(', ')}
          </span>
          <span className={`status status-${discussion.status}`}>
            {discussion.status === 'active' ? '진행 중' : 
             discussion.status === 'completed' ? '완료' : '일시정지'}
          </span>
        </div>
      </header>

      <main className="discussion-content">
        <StreamMessages 
          messages={discussion.messages}
          isLoading={false}
        />
      </main>

      <footer className="discussion-input">
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="메시지를 입력하세요..."
            className="message-input"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="send-button"
          >
            전송
          </button>
        </div>
      </footer>
    </div>
  );
};

export default DiscussionView;

