import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
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
      className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700"
    >
      {/* 코드 헤더 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-sm text-gray-400 font-medium">
          {language.toUpperCase()}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
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

      {/* 코드 내용 */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '14px',
            lineHeight: '1.5',
          }}
          lineNumberStyle={{
            color: '#6b7280',
            paddingRight: '1rem',
            minWidth: '3rem',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </motion.div>
  );
}
