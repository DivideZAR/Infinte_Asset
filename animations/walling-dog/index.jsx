import { useState, useEffect } from "react"

export function App() {
  const [isAnimating, setIsAnimating] = useState(true)
  const [message, setMessage] = useState("Ready to build")

  useEffect(() => {
    const messages = [
      "Ready to build",
      "Start prompting",
      "Create something amazing",
      "Build your vision"
    ]
    const interval = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)])
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f5f5f5 100%)',
      padding: '32px'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        textAlign: 'center'
      }}>
        {/* Animated Icon */}
        <div style={{
          display: 'inline-flex',
          height: '64px',
          width: '64px',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
          boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          `}</style>
          <svg
            style={{ width: '32px', height: '32px', color: 'white' }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M10 4v4" />
            <path d="M2 8h20" />
            <path d="M6 4v4" />
          </svg>
        </div>

        {/* Text Content */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '600',
            color: '#0f172a',
            letterSpacing: '-0.025em'
          }}>
            {message}
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '16px'
          }}>
            Start prompting to build your app.
          </p>
        </div>

        {/* Decorative Elements */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginTop: '16px'
        }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: `hsl(${240 + i * 20}, 70%, 70%)`,
                animation: `bounce ${0.5 + i * 0.1}s ease-in-out ${i * 0.1}s infinite`
              }}
            />
          ))}
          <style>{`
            @keyframes bounce {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          `}</style>
        </div>
      </div>
    </div>
  )
}

export default App
