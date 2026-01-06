import React, { useRef, useEffect } from 'react'

function PulseCircles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height

    const circles = []
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']

    for (let i = 0; i < 8; i++) {
      circles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 20 + Math.random() * 40,
        color: colors[i % colors.length],
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2
      })
    }

    let animationId

    function animate() {
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, width, height)

      const time = Date.now() / 1000

      circles.forEach((circle, index) => {
        const pulse = Math.sin(time * 2 + circle.pulsePhase)
        const currentRadius = circle.radius * (0.8 + 0.4 * pulse)

        ctx.beginPath()
        ctx.arc(circle.x, circle.y, currentRadius, 0, Math.PI * 2)
        ctx.fillStyle = circle.color
        ctx.globalAlpha = 0.6 + 0.4 * pulse
        ctx.fill()

        ctx.beginPath()
        ctx.arc(circle.x, circle.y, currentRadius * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.globalAlpha = 0.3
        ctx.fill()
      })

      ctx.globalAlpha = 1

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      style={{
        display: 'block',
        width: '800px',
        height: '600px',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}
    />
  )
}

export default PulseCircles
