import React, { useRef, useEffect } from 'react';

// Simplified 3D walking dog animation using canvas
export function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = 800;
    canvas.height = 600;
    
    let animationId;
    let time = 0;
    
    // Function to draw a voxel (cube) at a given position
    function drawVoxel(x, y, z, size, color) {
      // Simple 3D projection
      const scale = 100;
      const projX = x * scale + 400;
      const projY = -y * scale + 300 - z * scale * 0.3;
      
      ctx.fillStyle = color;
      ctx.fillRect(projX - size/2, projY - size/2, size, size);
      
      // Add a simple outline
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(projX - size/2, projY - size/2, size, size);
    }
    
    // Function to draw the walking dog
    function drawDog(offsetX = 0, offsetY = 0, offsetZ = 0) {
      const bodyColor = "#e8d5b7";
      const spotColor = "#1a1a1a";
      const noseColor = "#2d2d2d";
      const pawColor = "#d4c4a8";
      
      // Draw body parts with animation
      // Torso
      drawVoxel(0 + offsetX, 0 + offsetY, 0 + offsetZ, 30, bodyColor);
      drawVoxel(20 + offsetX, 0 + offsetY, 0 + offsetZ, 30, bodyColor);
      drawVoxel(-20 + offsetX, 0 + offsetY, 0 + offsetZ, 30, bodyColor);
      
      // Neck and head
      drawVoxel(35 + offsetX, 15 + offsetY, 0 + offsetZ, 25, bodyColor);
      drawVoxel(45 + offsetX, 25 + offsetY, 0 + offsetZ, 20, bodyColor); // head
      
      // Legs (with walking animation)
      const legAngle1 = Math.sin(time * 2) * 0.5;
      const legAngle2 = Math.sin(time * 2 + Math.PI) * 0.5;
      
      // Front legs
      drawVoxel(25 + offsetX, -30 + offsetY, 15 + offsetZ, 15, bodyColor);
      drawVoxel(25 + offsetX, -45 + offsetY, 15 + offsetZ, 15, pawColor);
      
      drawVoxel(25 + offsetX, -30 + offsetY, -15 + offsetZ, 15, bodyColor);
      drawVoxel(25 + offsetX, -45 + offsetY, -15 + offsetZ, 15, pawColor);
      
      // Back legs
      drawVoxel(-25 + offsetX, -30 + offsetY, 15 + offsetZ, 15, bodyColor);
      drawVoxel(-25 + offsetX, -45 + offsetY, 15 + offsetZ, 15, pawColor);
      
      drawVoxel(-25 + offsetX, -30 + offsetY, -15 + offsetZ, 15, bodyColor);
      drawVoxel(-25 + offsetX, -45 + offsetY, -15 + offsetZ, 15, pawColor);
      
      // Tail with wagging animation
      const tailOffset = Math.sin(time * 3) * 10;
      drawVoxel(-40 + offsetX, 10 + offsetY, tailOffset, 15, bodyColor);
    }
    
    function animate() {
      // Clear canvas with sky color
      ctx.fillStyle = '#87CEEB'; // Sky blue
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw ground
      ctx.fillStyle = '#8FBC8F'; // Dark sea green
      ctx.fillRect(0, 400, canvas.width, 200);
      
      // Draw some scenery
      for (let i = 0; i < 5; i++) {
        // Trees
        ctx.fillStyle = '#8B4513'; // Saddle brown
        ctx.fillRect(100 + i * 150, 350, 10, 50);
        
        ctx.fillStyle = '#228B22'; // Forest green
        ctx.beginPath();
        ctx.arc(105 + i * 150, 340, 20, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw the animated dog with movement
      const dogX = Math.sin(time * 0.5) * 100; // Move dog horizontally
      const dogZ = Math.cos(time * 0.5) * 20;  // Small Z movement for depth
      
      drawDog(dogX, 0, dogZ);
      
      // Increment time for animation
      time += 0.05;
      
      animationId = requestAnimationFrame(animate);
    }
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#1a1a2e' }}>
      <canvas 
        ref={canvasRef} 
        style={{ border: '1px solid #ccc', maxWidth: '100%', maxHeight: '100%' }}
      />
    </div>
  );
}

export default App;