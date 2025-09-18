import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 번역 리소스 import
import translationKO from './locales/ko/translation.json';
import translationEN from './locales/en/translation.json';
import translationJA from './locales/ja/translation.json';

const resources = {
  ko: {
    translation: translationKO,
  },
  en: {
    translation: translationEN,
  },
  ja: {
    translation: translationJA,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ko', // 기본 언어를 한국어로 강제 설정
    fallbackLng: 'ko',
    debug: false,

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    detection: {
      order: ['localStorage'], // localStorage만 사용, 브라우저 언어 감지 제거
      caches: ['localStorage'],
    },
  });

export default i18n;
