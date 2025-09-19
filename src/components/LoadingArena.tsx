import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// AI 캐릭터 데이터
const characters = [
  { name: 'ChatGPT', imgSrc: '/chatgpt.png', color: 'from-green-400 to-blue-500' },
  { name: 'Gemini', imgSrc: '/gemini.png', color: 'from-blue-400 to-purple-500' },
  { name: 'Claude', imgSrc: '/claude.png', color: 'from-orange-400 to-red-500' },
  { name: 'Grok', imgSrc: '/grok.png', color: 'from-purple-400 to-pink-500' },
];

const messages = [
  'Synapse 엔진 초기화 중...',
  '1라운드: AI 팀 초안 생성 중...',
  '2라운드: 교차 검증 및 비판 진행 중...',
  '3라운드: 근거 자료 보강 중...',
  '4라운드: 최종 답변 종합 중...',
  'Meta-Judge: 블라인드 평가 시작...',
  '최종 보고서 생성 중...'
];

export default function LoadingArena() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000); // 2초마다 메시지 변경
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="text-center space-y-6 sm:space-y-8 max-w-lg w-full">
        {/* AI 캐릭터 그리드 - 모바일 우선 수직 레이아웃 */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 justify-items-center">
          {characters.map((char, i) => (
            <motion.div
              key={char.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.3, duration: 0.5 }}
              className="relative flex flex-col items-center"
            >
              {/* AI 캐릭터 아바타 - 동적 크기 */}
              <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${char.color} p-1 shadow-lg`}>
                <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                  <span className="text-white font-bold text-lg sm:text-xl md:text-2xl">{char.name[0]}</span>
                </div>
              </div>
              
              {/* 펄스 애니메이션 */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                className="absolute -inset-2 rounded-full border-2 border-blue-400 opacity-30"
              />
              
              {/* AI 이름 - 동적 타이포그래피 */}
              <p className="text-white text-sm sm:text-base mt-2 font-medium">{char.name}</p>
            </motion.div>
          ))}
        </div>

        {/* 상태 메시지 - 모바일 가독성 향상 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={messages[messageIndex]}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 sm:space-y-6"
          >
            {/* 메시지 텍스트 - 동적 타이포그래피 */}
            <p className="text-lg sm:text-xl md:text-2xl text-white font-medium leading-relaxed px-2">
              {messages[messageIndex]}
            </p>
            
            {/* 로딩 도트 애니메이션 */}
            <div className="flex justify-center">
              <div className="flex space-x-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                    className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-400 rounded-full"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* 진행률 표시 - 모바일 최적화 */}
        <div className="w-full max-w-xs sm:max-w-sm mx-auto px-2">
          <div className="bg-gray-700 rounded-full h-2 sm:h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-400 to-purple-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((messageIndex + 1) / messages.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          <p className="text-gray-400 text-sm sm:text-base mt-2 font-medium">
            {messageIndex + 1} / {messages.length} 단계
          </p>
        </div>

        {/* 추가 정보 텍스트 - 모바일에서만 표시 */}
        <div className="sm:hidden mt-6 px-4">
          <p className="text-gray-500 text-sm text-center leading-relaxed">
            AI들이 협력하여 최고의 답변을 만들고 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}
