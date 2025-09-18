import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';

interface Message {
  id: string;
  speaker: string;
  content: string;
  timestamp: Date;
}

const DiscussionPage: React.FC = () => {
  const [question, setQuestion] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleStartDiscussion = async (): Promise<void> => {
    if (!question.trim()) return;

    setIsLoading(true);
    setMessages([]);

    try {
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      // 스트리밍 응답 처리
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let currentMessage = '';
      let currentSpeaker = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('**[') && line.includes(']**')) {
              // 새로운 화자 시작
              if (currentMessage && currentSpeaker) {
                setMessages(prev => [...prev, {
                  id: Date.now().toString(),
                  speaker: currentSpeaker,
                  content: currentMessage.trim(),
                  timestamp: new Date()
                }]);
              }
              currentSpeaker = line.match(/\*\*\[(.*?)\]\*\*/)?.[1] || '';
              currentMessage = '';
            } else if (line.trim()) {
              currentMessage += line + '\n';
            }
          }
        }

        // 마지막 메시지 추가
        if (currentMessage && currentSpeaker) {
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            speaker: currentSpeaker,
            content: currentMessage.trim(),
            timestamp: new Date()
          }]);
        }
      }
    } catch (error) {
      console.error('토론 시작 오류:', error);
      setMessages([{
        id: 'error',
        speaker: 'System',
        content: `오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !isLoading) {
      handleStartDiscussion();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Arena</h1>
          <p className="text-lg text-gray-600">두 AI가 펼치는 지적 토론의 장</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>토론 주제 입력</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="토론하고 싶은 주제를 입력하세요..."
                value={question}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleStartDiscussion}
                disabled={isLoading || !question.trim()}
                className="px-6"
              >
                {isLoading ? '토론 중...' : '토론 시작'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {messages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>AI 토론</span>
                <Badge variant="secondary">{messages.length}개 발언</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div key={message.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={message.speaker.includes('Eva') ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {message.speaker}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                      {index < messages.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">AI들이 토론을 준비하고 있습니다...</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DiscussionPage;
