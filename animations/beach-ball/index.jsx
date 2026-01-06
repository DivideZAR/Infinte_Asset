import { useEffect, useState } from "react"

export function App() {
  const [shadowScale, setShadowScale] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      const time = Date.now() / 1000
      const bounce = Math.abs(Math.sin(time * 2.5))
      setShadowScale(0.5 + (1 - bounce) * 0.5)
    }, 16)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      overflow: 'hidden',
      position: 'relative',
      background: 'linear-gradient(to bottom, #87ceeb 0%, #87ceeb 40%, #40e0d0 40%, #40e0d0 60%, #00bfff 60%, #00bfff 100%)'
    }}>
      {/* Sky gradient */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, #87ceeb, #87ceeb 60%, #40e0d0 70%, #00bfff 100%)'
      }} />
      
      {/* Sun */}
      <div style={{
        position: 'absolute',
        top: '48px',
        right: '64px',
        width: '96px',
        height: '96px',
        background: '#fde047',
        borderRadius: '50%',
        boxShadow: '0 0 40px rgba(253, 224, 71, 0.5)'
      }} />
      
      {/* Clouds */}
      <div style={{
        position: 'absolute',
        top: '80px',
        left: '40px',
        display: 'flex',
        gap: '8px'
      }}>
        <div style={{ width: '64px', height: '32px', background: 'white', borderRadius: '16px', opacity: 0.9 }} />
        <div style={{ width: '80px', height: '40px', background: 'white', borderRadius: '20px', opacity: 0.9, marginLeft: '-24px', marginTop: '-8px' }} />
        <div style={{ width: '56px', height: '32px', background: 'white', borderRadius: '16px', opacity: 0.9, marginLeft: '-16px' }} />
      </div>
      
      {/* Beach sand */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '128px',
        background: 'linear-gradient(to bottom, #f4d03f 0%, #f5d76e 50%, #d4ac0d 100%)'
      }}>
        {/* Sand dots */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.3 }}>
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                background: '#b7950b',
                borderRadius: '50%',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>
        
        {/* Shells */}
        <div style={{ position: 'absolute', bottom: '16px', left: '80px', fontSize: '24px' }}>🐚</div>
        <div style={{ position: 'absolute', bottom: '32px', right: '128px', fontSize: '20px' }}>🐚</div>
      </div>
      
      {/* Ball shadow on sand */}
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          left: '50%',
          width: '96px',
          height: '24px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '50%',
          filter: 'blur(4px)',
          transform: `translateX(-50%) scaleX(${shadowScale}) scaleY(${shadowScale * 0.5})`,
          transition: 'transform 75ms ease-out'
        }}
      />
      
      {/* Bouncing Beach Ball */}
      <div style={{
        position: 'absolute',
        bottom: '96px',
        left: '50%',
        animation: 'bounce 1s infinite cubic-bezier(0.35, 0, 0.65, 1)',
        transform: 'translateX(-50%)'
      }}>
        <style>{`
          @keyframes bounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(-180px); }
          }
        `}</style>
        <div style={{
          position: 'relative',
          width: '96px',
          height: '96px',
          animation: 'spin 4s linear infinite'
        }}>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
          
          {/* Ball SVG */}
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
            <defs>
              <radialGradient id="ballShine" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="white" stopOpacity="0.4" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              <radialGradient id="redGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ff4444" />
                <stop offset="100%" stopColor="#cc0000" />
              </radialGradient>
              <radialGradient id="whiteGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e0e0e0" />
              </radialGradient>
            </defs>
            
            {/* Ball circle */}
            <circle cx="50" cy="50" r="48" fill="url(#whiteGradient)" stroke="#ddd" strokeWidth="1" />
            
            {/* Beach ball stripes */}
            <path d="M50,2 A48,48 0 0,1 91.5,26.5 L50,50 Z" fill="url(#redGradient)" />
            <path d="M91.5,26.5 A48,48 0 0,1 91.5,73.5 L50,50 Z" fill="url(#whiteGradient)" />
            <path d="M91.5,73.5 A48,48 0 0,1 50,98 L50,50 Z" fill="url(#redGradient)" />
            <path d="M50,98 A48,48 0 0,1 8.5,73.5 L50,50 Z" fill="url(#whiteGradient)" />
            <path d="M8.5,73.5 A48,48 0 0,1 8.5,26.5 L50,50 Z" fill="url(#redGradient)" />
            <path d="M8.5,26.5 A48,48 0 0,1 50,2 L50,50 Z" fill="url(#whiteGradient)" />
            
            {/* Stripe divider lines */}
            <circle cx="50" cy="50" r="48" fill="none" stroke="#ccc" strokeWidth="1" />
            <line x1="50" y1="50" x2="50" y2="2" stroke="#bbb" strokeWidth="0.5" />
            <line x1="50" y1="50" x2="91.5" y2="26.5" stroke="#bbb" strokeWidth="0.5" />
            <line x1="50" y1="50" x2="91.5" y2="73.5" stroke="#bbb" strokeWidth="0.5" />
            <line x1="50" y1="50" x2="50" y2="98" stroke="#bbb" strokeWidth="0.5" />
            <line x1="50" y1="50" x2="8.5" y2="73.5" stroke="#bbb" strokeWidth="0.5" />
            <line x1="50" y1="50" x2="8.5" y2="26.5" stroke="#bbb" strokeWidth="0.5" />
            
            {/* Center circle */}
            <circle cx="50" cy="50" r="8" fill="white" stroke="#ccc" strokeWidth="0.5" />
            
            {/* Shine overlay */}
            <circle cx="50" cy="50" r="48" fill="url(#ballShine)" />
            
            {/* Highlight */}
            <ellipse cx="35" cy="30" rx="12" ry="8" fill="white" opacity="0.4" />
          </svg>
        </div>
      </div>
      
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: 'white',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          🏖️ Beach Ball Bounce 🏖️
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '8px', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
          Watch the ball bounce on the sandy beach!
        </p>
      </div>
      
      {/* Beach items */}
      <div style={{ position: 'absolute', bottom: '80px', right: '80px', fontSize: '32px' }}>🏄</div>
      <div style={{ position: 'absolute', bottom: '96px', left: '64px', fontSize: '24px' }}>🌴</div>
    </div>
  )
}

export default App
