export function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '32px', background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f4f4f5 100%)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', height: '64px', width: '64px', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 10px 25px rgba(99,102,241,0.3)', background: 'linear-gradient(135deg, #8b5cf6 0%, #4f46e5 50%, #4f46e5 100%)' }}>
          <svg
            style={{ height: '32px', width: '32px', color: 'white' }}
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
        <div >
          <h1 style={{ fontSize: '30px', fontWeight: '600', letterSpacing: '-0.025em', color: '#0f172a' }}>Ready to build</h1>
          <p style={{ color: '#64748b' }}>Start prompting to build your app.</p>
        </div>
      </div>
    </div>
  );
}
