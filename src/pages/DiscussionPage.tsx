import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Bot, Sparkles, Frown, ThumbsUp, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from '../components/LanguageSelector';;

// AI 응답 데이터 구조 정의
interface ArenaResponse {
  persona: string;
  key_takeaway: string;
  analysis: string;
  confidence_score: number;
  counter_prompt: string;
}

// AI 페르소나 정보
const PERSONAS = {
  "Dr. Eva (분석가)": { icon: Bot, color: "text-blue-500" },
  "Helios (비저너리)": { icon: Sparkles, color: "text-amber-500" }
};

export default function DiscussionPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const userQuery = searchParams.get('q');
  const discussionId = searchParams.get('id');

  const [debate, setDebate] = useState<ArenaResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const hasStarted = useRef(false);

  useEffect(() => {
    // UX 개선: 페이지 로드 시 단 한 번만 자동으로 토론 스트리밍 시작
    if (!userQuery || !discussionId || hasStarted.current) return;
    hasStarted.current = true;

    const startDebate = async () => {
      setIsLoading(true);
      setError('');
      try {
        // BUG FIX: 사용자의 실제 질문(userQuery)을 API로 전달
        const response = await fetch(`/api/stream?q=${encodeURIComponent(userQuery)}`);
        if (!response.ok || !response.body) {
          throw new Error('AI 아레나 서버에 연결할 수 없습니다.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          
          // AI가 보낸 JSON 객체를 파싱하여 화면에 표시
          // 여러 JSON 객체가 붙어서 올 수 있으므로 분리해서 처리
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || ''; // 마지막 불완전한 객체는 버퍼에 남김

          for (const part of parts) {
            try {
              const parsed = JSON.parse(part);
              setDebate(prev => [...prev, parsed]);
            } catch (e) {
              console.warn("JSON 파싱 오류 (스트리밍 중에는 정상일 수 있음):", part);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류 발생');
      } finally {
        setIsLoading(false);
      }
    };

    startDebate();
  }, [userQuery, discussionId]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tighter">AI ARENA</h1>
          <p className="text-lg text-gray-400 mt-2">"{userQuery}"</p>
        </header>

        <main className="space-y-6">
          <AnimatePresence>
            {debate.map((turn, index) => {
              const PersonaIcon = PERSONAS[turn.persona]?.icon || Frown;
              const personaColor = PERSONAS[turn.persona]?.color || "text-gray-400";
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <Card className="bg-gray-800 border-gray-700 shadow-lg">
                    <CardHeader className="flex flex-row items-center space-x-4">
                      <PersonaIcon className={`h-8 w-8 ${personaColor}`} />
                      <div>
                        <CardTitle className={`text-xl font-semibold ${personaColor}`}>{turn.persona}</CardTitle>
                        <p className="text-sm text-gray-400">자신감 점수: {turn.confidence_score}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-bold text-lg text-amber-300">핵심 결론</h3>
                        <p className="text-gray-200 mt-1">{turn.key_takeaway}</p>
                      </div>
                      <Separator className="bg-gray-700" />
                      <div>
                        <h3 className="font-bold text-lg">상세 분석</h3>
                        <div className="prose prose-invert mt-2 text-gray-300" dangerouslySetInnerHTML={{ __html: turn.analysis.replace(/\n/g, '<br />') }} />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between items-center bg-gray-800/50 p-4">
                       <p className="text-sm italic text-gray-400">"{turn.counter_prompt}"</p>
                       <Button variant="outline" className="text-white border-sky-500 hover:bg-sky-500">
                         <ThumbsUp className="mr-2 h-4 w-4" /> 더 설득력 있어요
                       </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isLoading && (
             <div className="text-center text-gray-400 flex items-center justify-center">
                <Sparkles className="h-5 w-5 mr-2 animate-pulse text-amber-300" />
                AI 검투사들이 격렬하게 토론 중입니다...
             </div>
          )}
          {error && <p className="text-red-500 text-center">{error}</p>}
        </main>
      </div>
    </div>
  );
}
