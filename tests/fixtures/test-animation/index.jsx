import React from 'react'

export function TestAnimation() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#1a1a2e',
      }}
    >
      <div
        style={{
          width: '100px',
          height: '100px',
          backgroundColor: '#ff6b6b',
          borderRadius: '50%',
        }}
      />
    </div>
  )
}

export default TestAnimation
