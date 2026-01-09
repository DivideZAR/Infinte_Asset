import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeDAnimation() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)

    const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000)
    camera.position.z = 5

    // Renderer setup
    // preserveDrawingBuffer is important for toDataURL optimization!
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setSize(800, 600)
    containerRef.current.appendChild(renderer.domElement)

    // Objects
    const geometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16)
    const material = new THREE.MeshNormalMaterial()
    const torusKnot = new THREE.Mesh(geometry, material)
    scene.add(torusKnot)

    // Animation loop
    const animate = () => {
      torusKnot.rotation.x += 0.02
      torusKnot.rotation.y += 0.03
      
      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      renderer.dispose()
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: '#1a1a2e'
      }} 
    />
  )
}
