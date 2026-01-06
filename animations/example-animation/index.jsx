import React, { useEffect, useRef } from 'react'

const DEFAULT_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#96CEB4',
  '#FFEAA7',
  '#DDA0DD',
  '#98D8C8'
]

function createBalls(count, width, height) {
  const balls = []
  
  for (let i = 0; i < count; i++) {
    const radius = 20 + Math.random() * 30
    const color = DEFAULT_COLORS[i % DEFAULT_COLORS.length]
    
    balls.push({
      id: i,
      x: radius + Math.random() * (width - radius * 2),
      y: radius + Math.random() * (height - radius * 2),
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      radius,
      color
    })
  }
  
  return balls
}

function updateBalls(balls, width, height) {
  return balls.map(ball => {
    let { x, y, vx, vy, radius } = ball
    
    x += vx
    y += vy
    
    if (x - radius < 0) {
      x = radius
      vx = -vx
    } else if (x + radius > width) {
      x = width - radius
      vx = -vx
    }
    
    if (y - radius < 0) {
      y = radius
      vy = -vy
    } else if (y + radius > height) {
      y = height - radius
      vy = -vy
    }
    
    return { ...ball, x, y, vx, vy }
  })
}

export function BouncingBalls({ ballCount = 5, backgroundColor = '#1a1a2e' }) {
  const canvasRef = useRef(null)
  const ballsRef = React.useRef([])
  const animationRef = React.useRef(null)
  const dimensionsRef = React.useRef({ width: 800, height: 600 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateDimensions = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const width = rect.width * dpr
      const height = rect.height * dpr
      
      canvas.width = width
      canvas.height = height
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
      }
      
      dimensionsRef.current = { width: rect.width, height: rect.height }
      
      ballsRef.current = createBalls(ballCount, rect.width, rect.height)
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    return () => {
      window.removeEventListener('resize', updateDimensions)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [ballCount])

  useEffect(() => {
    if (ballsRef.current.length === 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const animate = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const { width, height } = dimensionsRef.current
      
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, width, height)

      const updatedBalls = updateBalls(ballsRef.current, width, height)
      ballsRef.current = updatedBalls

      updatedBalls.forEach(ball => {
        ctx.beginPath()
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
        ctx.fillStyle = ball.color
        ctx.fill()
        
        ctx.beginPath()
        ctx.arc(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, ball.radius * 0.2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [ballsRef.current, backgroundColor])

  return (
    <canvas
      ref={canvasRef}
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

export default BouncingBalls
