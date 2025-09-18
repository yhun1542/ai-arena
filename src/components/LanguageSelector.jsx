import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center space-x-2">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            className={`
              flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${i18n.language === language.code 
                ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
              }
            `}
            title={language.name}
          >
            <span className="text-lg">{language.flag}</span>
            <span className="hidden sm:inline">{language.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
