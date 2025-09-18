import React from 'react';
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
    <div className="flex items-center space-x-2">
      {languages.map((language) => (
        <button
          key={language.code}
          onClick={() => changeLanguage(language.code)}
          className={`
            flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium
            transition-all duration-200 hover:bg-gray-100
            ${
              i18n.language === language.code
                ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-200'
                : 'text-gray-600 hover:text-gray-900'
            }
          `}
          title={language.name}
        >
          <span className="text-lg">{language.flag}</span>
          <span className="hidden sm:inline">{language.name}</span>
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
