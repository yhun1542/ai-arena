import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationKO from './locales/ko/translation.json';
import translationEN from './locales/en/translation.json';
import translationJA from './locales/ja/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translation: translationKO },
      en: { translation: translationEN },
      ja: { translation: translationJA },
    },
    fallbackLng: 'ko',
    
    // 언어 감지 옵션
    detection: {
      // 언어 감지 순서
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      // localStorage 키
      lookupLocalStorage: 'i18nextLng',
      
      // 캐시 설정
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false, // React는 XSS를 자동으로 방지
    },
    
    // 개발 모드에서 디버그 정보 표시
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n;
