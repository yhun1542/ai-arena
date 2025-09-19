import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface CodeViewProps {
  data: {
    code: string;
    language: string;
  };
}

export default function CodeView({ data }: CodeViewProps) {
  const { code, language } = data;
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-gray-900 rounded-lg overflow-hidden border border-gray-700 mx-2 sm:mx-0"
    >
      {/* 코드 헤더 - 모바일 최적화 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-4 py-3 bg-gray-800 border-b border-gray-700 space-y-2 sm:space-y-0">
        <span className="text-base sm:text-sm text-gray-400 font-medium">
          {language.toUpperCase()}
        </span>
        
        {/* 데스크톱용 버튼 (숨김 처리) */}
        <div className="hidden md:flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            {isCopied ? (
              <>
                <Check size={16} className="text-green-400" />
                <span className="text-green-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 코드 내용 - 모바일 가독성 향상 */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers
          customStyle={{
            margin: 0,
            padding: '1rem 0.75rem',
            background: 'transparent',
            fontSize: '14px',
            lineHeight: '1.6',
          }}
          wrapLongLines={true}
          lineNumberStyle={{
            color: '#6b7280',
            paddingRight: '0.75rem',
            minWidth: '2.5rem',
            fontSize: '12px',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>

      {/* 모바일 우선 하단 액션 바 (엄지손가락 법칙 적용) */}
      <div className="md:hidden sticky bottom-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 p-3">
        <div className="flex space-x-3">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 min-h-[44px] rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isCopied ? (
              <>
                <Check size={18} className="text-white" />
                <span>복사 완료!</span>
              </>
            ) : (
              <>
                <Copy size={18} />
                <span>코드 복사</span>
              </>
            )}
          </button>
          
          {/* 실행 버튼 (JavaScript/Python 등에서 활용 가능) */}
          {(language === 'javascript' || language === 'python' || language === 'typescript') && (
            <button className="flex items-center justify-center px-4 py-3 min-h-[44px] rounded-lg text-base font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500">
              <Play size={18} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
