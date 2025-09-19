import React from 'react';
import { motion } from 'framer-motion';

interface TableViewProps {
  data: {
    headers: string[];
    rows: string[][];
  };
}

export default function TableView({ data }: TableViewProps) {
  const { headers, rows } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* 모바일 우선 카드 레이아웃 */}
      <div className="block md:hidden space-y-4">
        {rows.map((row, rowIndex) => (
          <motion.div
            key={rowIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: rowIndex * 0.1 }}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg"
          >
            {headers.map((header, headerIndex) => (
              <div key={headerIndex} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-b border-gray-700 last:border-b-0">
                <div className="text-sm font-semibold text-blue-400 mb-1 sm:mb-0 sm:w-1/3">
                  {header}
                </div>
                <div className="text-base text-gray-200 sm:w-2/3 sm:text-right break-words">
                  {row[headerIndex]}
                </div>
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* 데스크톱 테이블 레이아웃 */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-700 shadow-lg">
        <table className="w-full border-collapse bg-gray-800">
          <thead>
            <tr className="bg-gray-700">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-4 py-4 lg:px-6 lg:py-5 text-left text-base lg:text-lg font-semibold text-gray-200 border-b border-gray-600 min-w-[120px]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: rowIndex * 0.1 }}
                className="hover:bg-gray-700 transition-colors duration-200"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-4 lg:px-6 lg:py-5 text-base lg:text-lg text-gray-300 border-b border-gray-600 break-words"
                  >
                    {cell}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 테이블 정보 - 모바일에서 추가 정보 제공 */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-400 space-y-2 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          <span>총 {rows.length}개 항목</span>
        </div>
        
        {/* 모바일에서 스크롤 힌트 */}
        <div className="md:hidden text-xs text-gray-500 flex items-center space-x-1">
          <span>↔</span>
          <span>좌우로 스와이프하여 더 보기</span>
        </div>
        
        {/* 데스크톱에서 정렬 힌트 */}
        <div className="hidden md:block text-xs text-gray-500">
          열 제목을 클릭하여 정렬 (향후 기능)
        </div>
      </div>
    </motion.div>
  );
}
