import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock } from 'lucide-react';

interface TimelineViewProps {
  data: {
    events: Array<{ date: string; event: string; }>;
  };
}

export default function TimelineView({ data }: TimelineViewProps) {
  const { events } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-6 px-2 sm:px-0 max-w-4xl mx-auto"
    >
      {/* 타임라인 헤더 */}
      <div className="flex items-center space-x-2 mb-6 sm:mb-8">
        <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">타임라인</h3>
        <div className="flex-1 h-px bg-gray-600 ml-4"></div>
      </div>

      {events.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="relative flex items-start space-x-3 sm:space-x-4"
        >
          {/* 타임라인 도트와 연결선 */}
          <div className="flex flex-col items-center flex-shrink-0 relative">
            {/* 연결선 (위쪽) */}
            {index > 0 && (
              <div className="w-0.5 h-6 sm:h-8 bg-gradient-to-b from-gray-600 to-blue-400 -mt-2"></div>
            )}
            
            {/* 타임라인 도트 */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 0.2, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full border-2 border-gray-800 shadow-lg z-10 relative">
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
              </div>
            </motion.div>
            
            {/* 연결선 (아래쪽) */}
            {index < events.length - 1 && (
              <div className="w-0.5 flex-grow bg-gradient-to-b from-blue-400 to-gray-600 mt-2 min-h-[3rem] sm:min-h-[4rem]"></div>
            )}
          </div>
          
          {/* 이벤트 카드 */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="flex-1 pb-6 sm:pb-8"
          >
            <div className="bg-gray-800 rounded-xl p-4 sm:p-5 md:p-6 border border-gray-700 shadow-lg hover:shadow-xl hover:border-gray-600 transition-all duration-300">
              {/* 날짜 헤더 */}
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 flex-shrink-0" />
                <div className="text-sm sm:text-base text-blue-400 font-semibold bg-blue-400/10 px-3 py-1 rounded-full">
                  {item.date}
                </div>
              </div>
              
              {/* 이벤트 내용 */}
              <div className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed">
                {item.event}
              </div>
              
              {/* 추가 메타데이터 (향후 확장 가능) */}
              <div className="mt-4 pt-3 border-t border-gray-700 flex items-center justify-between text-xs sm:text-sm text-gray-500">
                <span>이벤트 #{index + 1}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>완료</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ))}

      {/* 타임라인 완료 표시 */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: events.length * 0.1 + 0.5, type: "spring" }}
        className="flex items-center justify-center mt-8 sm:mt-12"
      >
        <div className="flex items-center space-x-3 bg-gray-800 px-6 py-3 rounded-full border border-gray-700">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-base sm:text-lg text-gray-300 font-medium">타임라인 완료</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
