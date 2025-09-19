import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SynapseResult() {
  const router = useRouter();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // sessionStorage에서 결과 데이터 가져오기
    const storedResult = sessionStorage.getItem('synapseResult');
    if (storedResult) {
      try {
        const data = JSON.parse(storedResult);
        setResultData(data);
      } catch (error) {
        console.error('결과 데이터 파싱 오류:', error);
      }
    }
    setLoading(false);
  }, []);

  const handleBackToHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div>로딩 중...</div>
      </div>
    );
  }

  if (!resultData) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        padding: '2rem'
      }}>
        <h1 style={{ marginBottom: '2rem' }}>결과를 찾을 수 없습니다</h1>
        <button 
          onClick={handleBackToHome}
          style={{
            padding: '1rem 2rem',
            background: 'linear-gradient(45deg, #00d4ff, #4ecdc4)',
            border: 'none',
            borderRadius: '50px',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const { query, result, timestamp } = resultData;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif',
      padding: '2rem'
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '0 1rem'
      }}>
        <h1 style={{
          fontSize: '2rem',
          background: 'linear-gradient(45deg, #00d4ff, #ff6b6b, #4ecdc4)',
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Synapse 결과
        </h1>
        <button 
          onClick={handleBackToHome}
          style={{
            padding: '0.5rem 1rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '25px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          새 검색
        </button>
      </div>

      {/* 질문 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '1.5rem',
        borderRadius: '15px',
        marginBottom: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h3 style={{ marginBottom: '0.5rem', color: '#00d4ff' }}>질문</h3>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>{query}</p>
      </div>

      {/* 결과 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '1.5rem',
        borderRadius: '15px',
        marginBottom: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#4ecdc4' }}>AI 응답</h3>
        
        {result && result.orchestration ? (
          <div>
            {/* 오케스트레이션 결과 */}
            {result.orchestration.answer && (
              <div style={{
                background: 'rgba(0, 212, 255, 0.1)',
                padding: '1rem',
                borderRadius: '10px',
                marginBottom: '1rem',
                border: '1px solid rgba(0, 212, 255, 0.3)'
              }}>
                <h4 style={{ color: '#00d4ff', marginBottom: '0.5rem' }}>통합 답변</h4>
                <p style={{ lineHeight: '1.6' }}>{result.orchestration.answer}</p>
              </div>
            )}
            
            {/* 개별 모델 응답 */}
            {result.responses && result.responses.length > 0 && (
              <div>
                <h4 style={{ marginBottom: '1rem', color: '#ff6b6b' }}>모델별 응답</h4>
                {result.responses.map((response, index) => (
                  <div key={index} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    padding: '1rem',
                    borderRadius: '10px',
                    marginBottom: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    <h5 style={{ 
                      color: '#4ecdc4', 
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem'
                    }}>
                      {response.model || `모델 ${index + 1}`}
                    </h5>
                    <p style={{ 
                      lineHeight: '1.5',
                      fontSize: '0.95rem'
                    }}>
                      {response.content || response.answer || '응답 없음'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            background: 'rgba(255, 107, 107, 0.1)',
            padding: '1rem',
            borderRadius: '10px',
            border: '1px solid rgba(255, 107, 107, 0.3)'
          }}>
            <p>응답을 처리하는 중 오류가 발생했습니다.</p>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '0.5rem' }}>
              {JSON.stringify(result, null, 2)}
            </p>
          </div>
        )}
      </div>

      {/* 메타데이터 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        padding: '1rem',
        borderRadius: '10px',
        fontSize: '0.9rem',
        opacity: 0.8
      }}>
        <p>처리 시간: {new Date(timestamp).toLocaleString('ko-KR')}</p>
      </div>
    </div>
  );
}
