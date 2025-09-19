export default function Home() {
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
      <h1 style={{
        fontSize: '4rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        background: 'linear-gradient(45deg, #00d4ff, #ff6b6b, #4ecdc4)',
        backgroundSize: '200% 200%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        animation: 'gradient 3s ease infinite'
      }}>
        Synapse
      </h1>
      
      <p style={{
        fontSize: '1.5rem',
        marginBottom: '3rem',
        opacity: 0.8,
        textAlign: 'center'
      }}>
        AI Arena - 차세대 인공지능 플랫폼
      </p>
      
      <div style={{
        width: '100%',
        maxWidth: '600px'
      }}>
        <input
          type="text"
          placeholder="질문을 입력하세요..."
          style={{
            width: '100%',
            padding: '1rem 1.5rem',
            fontSize: '1.1rem',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            marginBottom: '1rem'
          }}
        />
        
        <button style={{
          padding: '1rem 2rem',
          background: 'linear-gradient(45deg, #00d4ff, #4ecdc4)',
          border: 'none',
          borderRadius: '50px',
          color: 'white',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '1rem'
        }}>
          검색
        </button>
      </div>
      
      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
