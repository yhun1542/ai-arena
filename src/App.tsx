import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import HomePage from './pages/HomePage';
import SynapseResultPage from './pages/SynapseResultPage';
import DiscussionPage from './pages/DiscussionPage'; // 기존 페이지 호환성 유지

function App() {
  return (
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <Router>
          <Routes>
            {/* Synapse v2 메인 페이지 */}
            <Route path="/" element={<HomePage />} />
            
            {/* Synapse v2 결과 페이지 */}
            <Route path="/discussion/:id" element={<SynapseResultPage />} />
            
            {/* 기존 토론 페이지 (호환성 유지) */}
            <Route path="/legacy/discussion" element={<DiscussionPage />} />
            
            {/* 404 처리 - 홈으로 리다이렉트 */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Router>
      </I18nextProvider>
    </HelmetProvider>
  );
}

export default App;
