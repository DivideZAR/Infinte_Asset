import React, { useEffect, useRef, useState, useMemo } from 'react'

/**
 * EPISODE 1 / SCENE 1 — “The Influx” (Glucose Management)
 * A single-file React animation.
 */

const TOTAL_DURATION = 30 // seconds
const CUBE_COUNT = 800 // "Millions" simulated by hundreds
const HIGHWAY_Y_MIN = 0.3 // % of height
const HIGHWAY_Y_MAX = 0.7 // % of height
const DOOR_SPLIT = 0.5 // Center X

// Pseudo-random generator for stability
const srandom = (seed) => {
  let x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

// Cube class for object pooling/management
class Cube {
  constructor(id) {
    this.id = id
    this.reset()
    // Deterministic random based on ID
    this.depth = srandom(id) * 0.5 + 0.5 // 0.5 to 1.0
    this.yOffset = srandom(id + 1) // 0 to 1
    this.speedBase = srandom(id + 2) * 2 + 1
    this.hue = 45 + srandom(id + 3) * 10 // Gold/Yellow variants
  }

  reset() {
    this.x = -100 - srandom(this.id * 10) * 200 // Start offscreen left
    this.active = false
    this.jammed = false
  }
}

export default function App() {
  const canvasRef = useRef(null)
  const requestRef = useRef(null)
  const startTimeRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [isFinished, setIsFinished] = useState(false)

  // Audio/Alarm state
  const [alarmActive, setAlarmActive] = useState(false)
  const [voVisible, setVoVisible] = useState(false)

  useEffect(() => {
    window.animationReady = true
  }, [])

  useEffect(() => {
    window.animationReady = true
  }, [])

  // Cubes pool
  const cubes = useMemo(() => {
    const arr = []
    for (let i = 0; i < CUBE_COUNT; i++) {
      arr.push(new Cube(i))
    }
    return arr
  }, [])

  // Playback control
  const togglePlay = () => {
    if (isFinished) {
      handleRestart()
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const handleRestart = () => {
    setIsPlaying(true)
    setCurrentTime(0)
    setIsFinished(false)
    startTimeRef.current = performance.now()
    cubes.forEach((c) => c.reset())
  }

  // Main Animation Loop
  const animate = (time) => {
    if (!isPlaying) {
      startTimeRef.current = null // Reset so we don't jump when resuming
      return
    }

    if (startTimeRef.current === null) {
      startTimeRef.current = time - currentTime * 1000
    }

    const elapsed = (time - startTimeRef.current) / 1000

    if (elapsed >= TOTAL_DURATION) {
      setCurrentTime(TOTAL_DURATION)
      setIsFinished(true)
      setIsPlaying(false)
      draw(TOTAL_DURATION) // Draw final frame
      return
    }

    setCurrentTime(elapsed)
    draw(elapsed)
    requestRef.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate)
    } else {
      cancelAnimationFrame(requestRef.current)
    }
    return () => cancelAnimationFrame(requestRef.current)
  }, [isPlaying])

  // Drawing Logic
  const draw = (t) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = canvas.width
    const h = canvas.height

    // Clear
    ctx.clearRect(0, 0, w, h)

    // --- SCENE PARAMS ---
    const doorProgress = Math.min(Math.max((t - 3.0) / 3.0, 0), 1) // Open 3s-6s
    const shakeIntensity = t < 10 ? (t < 3 ? 0.5 : 1.0) : t > 20 ? (t - 20) * 0.2 : 0.1
    const isAlarm = t < 10 && Math.floor(t * 4) % 2 === 0 // Flash 4hz
    const trafficJamFactor = Math.max(0, (t - 6) / 24) // 0 to 1

    // Screen Shake (apply transform)
    ctx.save()
    if (isPlaying) {
      const dx = (Math.random() - 0.5) * shakeIntensity * 2
      const dy = (Math.random() - 0.5) * shakeIntensity * 2
      ctx.translate(dx, dy)
    }

    // 1. Background
    // Stomach Sector (Left) -> Bloodstream (Right)
    const bgGradient = ctx.createLinearGradient(0, 0, w, 0)
    bgGradient.addColorStop(0, '#0f0f15') // Dark Industrial
    bgGradient.addColorStop(0.4, '#1a0505') // Transition
    bgGradient.addColorStop(1, '#3a0000') // Bloodstream Red
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, w, h)

    // Highway "Floor"
    const highwayH = h * (HIGHWAY_Y_MAX - HIGHWAY_Y_MIN)
    const highwayY = h * HIGHWAY_Y_MIN

    ctx.fillStyle = 'rgba(50, 0, 0, 0.5)'
    ctx.fillRect(0, highwayY, w, highwayH)

    // Grid lines on highway
    ctx.strokeStyle = 'rgba(255, 50, 50, 0.2)'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let ix = 0; ix < w; ix += 50) {
      ctx.moveTo(ix - ((t * 100) % 50), highwayY)
      ctx.lineTo(ix - ((t * 100) % 50) + 100, highwayY + highwayH) // Perspective lines? Just flat for now
    }
    // Horizontal lines moving left
    const speedPixels = 200
    const offset = (t * speedPixels) % 100
    for (let lx = -offset; lx < w; lx += 100) {
      ctx.moveTo(lx, highwayY)
      ctx.lineTo(lx, highwayY + highwayH)
    }
    ctx.stroke()

    // 2. Cubes (Glucose)
    // Spawn logic
    const influxStart = 3.5
    const influxRate = t > influxStart ? Math.min((t - influxStart) * 2, 50) : 0 // Cubes per frame ish

    // Draw cubes
    ctx.shadowBlur = 10
    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)'

    cubes.forEach((cube, i) => {
      // Activate new cubes based on time and ID
      if (!cube.active && t > influxStart) {
        // Stagger activation
        if (i < (t - influxStart) * 50) {
          cube.active = true
          cube.x = w * 0.1 // Start at door opening
        }
      }

      if (cube.active) {
        // Movement
        // Jam logic: as they get further right, they slow down if trafficJamFactor is high
        let speed = cube.speedBase * 3 * (w / 1920) // Scale speed by width

        // Traffic Jam Effect
        // If x > w * 0.5, speed drops based on time
        if (cube.x > w * 0.5) {
          const jamSeverity = Math.max(0, (t - 15) / 10) // 0 to 1.5
          speed *= Math.max(0.1, 1 - jamSeverity)
        }

        if (isPlaying) {
          cube.x += speed
        }

        // Recycling (loop around if desired? No, "The Influx" implies filling up)
        // If they go off screen, maybe stop rendering but keep state?
        // Let's keep them piling up visually by slowing them drastically at the end?
        // Actually prompt says "Traffic jam becomes instant" -> "cubes begin to bunch up".

        // Draw
        const size = 10 * cube.depth
        const cy = highwayY + cube.yOffset * (highwayH - size)

        ctx.fillStyle = `hsl(${cube.hue}, 100%, 50%)`
        ctx.globalAlpha = cube.depth // Fade distant ones
        ctx.fillRect(cube.x, cy, size, size)
        ctx.globalAlpha = 1.0
      }
    })
    ctx.shadowBlur = 0

    // 3. Bay Doors (Foreground)
    const doorW = w * 0.5
    const openAmount = doorProgress * (doorW - w * 0.1) // Leave 10% on edges

    // Left Door
    const leftDoorX = -openAmount
    ctx.fillStyle = '#111'
    ctx.fillRect(leftDoorX, 0, doorW, h)
    // Door details
    ctx.fillStyle = '#222'
    ctx.fillRect(leftDoorX + doorW - 20, 0, 20, h) // Edge
    ctx.fillStyle = isAlarm ? '#ff0000' : '#500'
    ctx.fillRect(leftDoorX + doorW - 10, h / 2 - 50, 5, 100) // Lock light

    // Right Door
    const rightDoorX = w * 0.5 + openAmount
    ctx.fillStyle = '#111'
    ctx.fillRect(rightDoorX, 0, doorW, h)
    // Door details
    ctx.fillStyle = '#222'
    ctx.fillRect(rightDoorX, 0, 20, h) // Edge
    ctx.fillStyle = isAlarm ? '#ff0000' : '#500'
    ctx.fillRect(rightDoorX + 5, h / 2 - 50, 5, 100) // Lock light

    // 4. Cracks (Walls vibrating and cracking)
    // Walls are at highwayY and highwayY + highwayH
    if (t > 5) {
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.beginPath()
      // Top Wall
      const crackProgress = Math.max(0, (t - 10) / 20) // 0 to 1
      if (crackProgress > 0) {
        const startX = w * 0.2
        ctx.moveTo(startX, highwayY)
        let cx = startX
        let cy = highwayY
        for (let k = 0; k < crackProgress * 50; k++) {
          cx += 20
          cy = highwayY + (Math.random() - 0.5) * 30
          ctx.lineTo(cx, cy)
        }
      }
      // Bottom Wall
      if (crackProgress > 0) {
        const startX = w * 0.3
        ctx.moveTo(startX, highwayY + highwayH)
        let cx = startX
        let cy = highwayY + highwayH
        for (let k = 0; k < crackProgress * 60; k++) {
          cx += 15
          cy = highwayY + highwayH + (Math.random() - 0.5) * 30
          ctx.lineTo(cx, cy)
        }
      }
      ctx.stroke()
    }

    // 5. Alarm Overlay (Canvas part)
    if (t < 10) {
      ctx.save()
      ctx.globalAlpha = Math.max(0, 1 - t / 10) * (Math.sin(t * 10) * 0.5 + 0.5)
      ctx.fillStyle = 'red'
      ctx.fillRect(0, 0, w, h) // Red flash
      ctx.restore()
    }

    ctx.restore() // End shake
  }

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        // Set actual size to match display size for sharpness
        const parent = canvasRef.current.parentElement
        canvasRef.current.width = parent.clientWidth * window.devicePixelRatio
        canvasRef.current.height = parent.clientHeight * window.devicePixelRatio

        // Normalize coordinates in draw
        draw(currentTime)
      }
    }
    window.addEventListener('resize', handleResize)
    handleResize() // Init
    return () => window.removeEventListener('resize', handleResize)
  }, [currentTime])

  // UI Updates
  useEffect(() => {
    setAlarmActive(currentTime < 10)
    setVoVisible(currentTime > 8 && currentTime < 18)
  }, [currentTime])

  // Helper formats
  const formatTime = (t) => {
    const s = Math.floor(t)
    return `0:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-mono text-white select-none">
      {/* Canvas Layer */}
      <div className="absolute inset-0 z-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
        {/* Top Bar: Alarm */}
        <div className="flex justify-between items-start">
          <div className="bg-black/50 p-2 border border-red-500/30 backdrop-blur-sm rounded">
            <div className="text-xs text-red-400">SECTOR</div>
            <div className="text-lg font-bold">STOMACH // BLOODSTREAM</div>
          </div>

          <div
            className={`transition-opacity duration-200 ${alarmActive ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="bg-red-600/90 text-white px-6 py-2 rounded animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.6)]">
              <h1 className="text-2xl font-black tracking-widest">INCOMING CARGO</h1>
            </div>
          </div>

          <div className="bg-black/50 p-2 border border-blue-500/30 backdrop-blur-sm rounded text-right">
            <div className="text-xs text-blue-400">PRESSURE</div>
            <div className="text-lg font-bold text-blue-200">
              {Math.min(100 + currentTime * 5, 250).toFixed(0)} PSI
            </div>
          </div>
        </div>

        {/* Center: VO Subtitles */}
        <div className="flex-1 flex items-end justify-center pb-20">
          <div
            className={`transition-all duration-1000 transform ${voVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <div className="bg-black/80 px-6 py-4 rounded-lg border-l-4 border-yellow-500 max-w-2xl text-center backdrop-blur-md">
              <p className="text-xl md:text-2xl font-semibold text-yellow-50 shadow-black drop-shadow-md">
                “The system is flooded. Pressure is critical. If we don’t move this cargo, the whole
                structure collapses.”
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Controls */}
        {false && (
          <div className="hidden pointer-events-auto flex items-center gap-4 bg-zinc-900/80 p-4 rounded-xl border border-white/10 backdrop-blur self-center w-full max-w-xl">
            <button
            onClick={togglePlay}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
          >
            {isFinished ? (
              // Restart Icon
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            ) : isPlaying ? (
              // Pause Icon
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 9v6m4-6v6"
                />
              </svg>
            ) : (
              // Play Icon
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
              </svg>
            )}
          </button>

          <div className="flex-1 flex flex-col gap-1">
            <div className="flex justify-between text-xs text-gray-400 font-bold uppercase tracking-wider">
              <span>Timeline</span>
              <span>
                {formatTime(currentTime)} / {formatTime(TOTAL_DURATION)}
              </span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden relative">
              <div
                className="absolute top-0 left-0 h-full bg-yellow-500 transition-all duration-75 ease-linear"
                style={{ width: `${(currentTime / TOTAL_DURATION) * 100}%` }}
              />
            </div>
          </div>
        </div>
        )}
      </div>

    </div>
  </div>
  </div>
  )
  )
}
