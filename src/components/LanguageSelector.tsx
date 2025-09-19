import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <div className="w-full sm:w-auto">
      {/* 모바일 우선 수직 레이아웃, 태블릿 이상에서 수평 */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`
              flex items-center justify-center sm:justify-start space-x-2 px-4 py-3 min-h-[44px] rounded-lg text-base font-medium
              transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
              ${
                i18n.language === language.code
                  ? 'bg-blue-600 text-white ring-2 ring-blue-500 shadow-lg focus:ring-blue-500'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white focus:ring-gray-500'
              }
            `}
            title={language.name}
          >
            <span className="text-xl">{language.flag}</span>
            <span className="block sm:hidden md:inline font-medium">{language.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
