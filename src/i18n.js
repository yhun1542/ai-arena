import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 번역 리소스
const resources = {
  ko: {
    translation: {
      // 메인 페이지
      title: "AI Arena - AI와 함께하는 토론의 장",
      subtitle: "AI와 함께 다양한 주제로 토론해보세요",
      searchPlaceholder: "토론하고 싶은 주제를 입력하세요...",
      startDiscussion: "토론 시작",
      
      // 토론 페이지
      discussionTitle: "AI 응답",
      getAiResponse: "AI 응답 받기",
      loading: "로딩 중",
      
      // 에러 메시지
      error: "오류가 발생했습니다",
      networkError: "네트워크 연결을 확인해주세요",
      invalidInput: "질문을 입력해주세요",
      
      // 공통
      back: "홈으로 돌아가기",
      retry: "다시 시도",
      close: "닫기"
    }
  },
  en: {
    translation: {
      // Main page
      title: "AI Arena - Discussion Platform with AI",
      subtitle: "Engage in discussions on various topics with AI",
      searchPlaceholder: "Enter a topic you'd like to discuss...",
      startDiscussion: "Start Discussion",
      
      // Discussion page
      discussionTitle: "AI Response",
      getAiResponse: "Get AI Response",
      loading: "Loading",
      
      // Error messages
      error: "An error occurred",
      networkError: "Please check your network connection",
      invalidInput: "Please enter your question",
      
      // Common
      back: "Back to Home",
      retry: "Retry",
      close: "Close"
    }
  },
  ja: {
    translation: {
      // メインページ
      title: "AI Arena - AIとの議論プラットフォーム",
      subtitle: "AIと様々なトピックについて議論してみましょう",
      searchPlaceholder: "議論したいトピックを入力してください...",
      startDiscussion: "議論を開始",
      
      // 議論ページ
      discussionTitle: "AI応答",
      getAiResponse: "AI応答を取得",
      loading: "読み込み中",
      
      // エラーメッセージ
      error: "エラーが発生しました",
      networkError: "ネットワーク接続を確認してください",
      invalidInput: "質問を入力してください",
      
      // 共通
      back: "ホームに戻る",
      retry: "再試行",
      close: "閉じる"
    }
  }
};

i18n
  // 언어 감지 플러그인 사용
  .use(LanguageDetector)
  // React와 연결
  .use(initReactI18next)
  // 초기화
  .init({
    resources,
    
    // 기본 언어 설정
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
    
    // 보간 설정
    interpolation: {
      escapeValue: false, // React는 XSS를 자동으로 방지
    },
    
    // 개발 모드에서 디버그 정보 표시
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n;
