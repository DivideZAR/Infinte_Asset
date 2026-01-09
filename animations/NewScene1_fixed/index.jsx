import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function TheInfluxAnimation() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0505)

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.current.appendChild(renderer.domElement)

    // Basic lighting
    const ambientLight = new THREE.AmbientLight(0x442222, 0.6)
    scene.add(ambientLight)

    // Simple cube
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshPhongMaterial({ color: 0xffd700 })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    camera.position.z = 5

    // Animation loop
    const animate = () => {
      cube.rotation.x += 0.01
      cube.rotation.y += 0.01
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }

    animate()

    // CRITICAL: Signal ready for frame capture
    window.animationReady = true

    return () => {
      cancelAnimationFrame(animationRef.current)
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#000' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: '#ff6644',
        fontSize: '14px',
        fontFamily: 'monospace'
      }}>
        EPISODE 1: THE DELIVERY | Scene 1: The Influx (Simplified)
      </div>
    </div>
  )
}