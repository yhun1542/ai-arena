import React from 'react';
import { motion } from 'framer-motion';

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
      className="space-y-6"
    >
      {events.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="flex items-start space-x-4"
        >
          {/* 타임라인 도트 */}
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 bg-blue-400 rounded-full border-2 border-gray-800" />
            {index < events.length - 1 && (
              <div className="w-0.5 h-16 bg-gray-600 mt-2" />
            )}
          </div>
          
          {/* 이벤트 내용 */}
          <div className="flex-1 pb-8">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-sm text-blue-400 font-medium mb-2">
                {item.date}
              </div>
              <div className="text-gray-200">
                {item.event}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
