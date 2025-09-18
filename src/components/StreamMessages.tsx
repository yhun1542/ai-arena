import React, { useState, useEffect, useRef, useCallback } from 'react';

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
  return (
    <div className="stream-messages">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={`message message-${message.type}`}
          data-timestamp={message.timestamp.toISOString()}
        >
          <div className="message-content">
            {message.content}
          </div>
          {message.type === 'ai' && (
            <div className="message-actions">
              <button className="action-copy" aria-label="메시지 복사">
                📋
              </button>
              <button className="action-like" aria-label="좋아요">
                👍
              </button>
            </div>
          )}
        </div>
      ))}
      
      {isLoading && (
        <div className="message message-ai loading">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamMessages;

