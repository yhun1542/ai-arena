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
      className="overflow-x-auto rounded-lg"
    >
      <table className="w-full border-collapse bg-gray-800 rounded-lg overflow-hidden min-w-full">
        <thead>
          <tr className="bg-gray-700">
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-200 border-b border-gray-600"
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
              className="hover:bg-gray-700 transition-colors"
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-300 border-b border-gray-600"
                >
                  {cell}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
