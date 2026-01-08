import React, { useEffect, useRef } from 'react'

export default function ParticleBurst() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    
    let particles = []
    const particleCount = 100
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        life: 1.0,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      })
    }

    const animate = () => {
      // Clear with trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, index) => {
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.01
        
        if (p.life > 0) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.fill()
        } else {
          // Reset particle to center
          p.x = canvas.width / 2
          p.y = canvas.height / 2
          p.life = 1.0
          p.vx = (Math.random() - 0.5) * 10
          p.vy = (Math.random() - 0.5) * 10
        }
      })

      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000' }}>
      <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid #333' }} />
    </div>
  )
}
