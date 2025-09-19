import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

// Synapse v3 컴포넌트
import HomePageV3 from './pages/HomePage-v3';
import SynapseResultPageV3 from './pages/SynapseResultPage-v3';

// 기존 컴포넌트 (호환성 유지)
import HomePage from './pages/HomePage';
import SynapseResultPage from './pages/SynapseResultPage';
import DiscussionPage from './pages/DiscussionPage';

function App() {
  return (
    <HelmetProvider>
      <I18nextProvider i18n={i18n}>
        <Router>
          <Routes>
            {/* Synapse v3 메인 페이지 */}
            <Route path="/" element={<HomePageV3 />} />
            
            {/* Synapse v3 결과 페이지 */}
            <Route path="/synapse/result" element={<SynapseResultPageV3 />} />
            
            {/* 기존 v2 페이지들 (호환성 유지) */}
            <Route path="/v2" element={<HomePage />} />
            <Route path="/v2/discussion/:id" element={<SynapseResultPage />} />
            <Route path="/discussion/:id" element={<SynapseResultPage />} />
            <Route path="/legacy/discussion" element={<DiscussionPage />} />
            
            {/* 404 처리 - 홈으로 리다이렉트 */}
            <Route path="*" element={<HomePageV3 />} />
          </Routes>
        </Router>
      </I18nextProvider>
    </HelmetProvider>
  );
}

export default App;
