import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { EffectComposer, Bloom, SMAA, Vignette, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

// High-quality Voxel cube component with better materials
function Voxel({ 
  position, 
  color, 
  scale = 1,
  roughness = 0.7,
  metalness = 0.1
}: { 
  position: [number, number, number]; 
  color: string; 
  scale?: number;
  roughness?: number;
  metalness?: number;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[scale, scale, scale]} />
      <meshStandardMaterial 
        color={color} 
        roughness={roughness}
        metalness={metalness}
        envMapIntensity={0.5}
      />
    </mesh>
  );
}

// Detailed Voxel Dog with walking animation
function VoxelDog({ position }: { position: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const frontLeftLegRef = useRef<THREE.Group>(null);
  const frontRightLegRef = useRef<THREE.Group>(null);
  const backLeftLegRef = useRef<THREE.Group>(null);
  const backRightLegRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime() * 4;
    
    // Leg walking animation
    if (frontLeftLegRef.current) {
      frontLeftLegRef.current.rotation.x = Math.sin(time) * 0.5;
    }
    if (frontRightLegRef.current) {
      frontRightLegRef.current.rotation.x = Math.sin(time + Math.PI) * 0.5;
    }
    if (backLeftLegRef.current) {
      backLeftLegRef.current.rotation.x = Math.sin(time + Math.PI) * 0.5;
    }
    if (backRightLegRef.current) {
      backRightLegRef.current.rotation.x = Math.sin(time) * 0.5;
    }
    
    // Tail wagging
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(time * 2.5) * 0.4;
      tailRef.current.rotation.y = Math.sin(time * 2.5) * 0.2;
    }
    
    // Head bobbing slightly
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(time * 0.5) * 0.05;
      headRef.current.position.y = Math.sin(time * 2) * 0.03;
    }
    
    // Body bob
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.abs(Math.sin(time * 2)) * 0.08;
    }
  });

  const bodyColor = "#e8d5b7";
  const spotColor = "#1a1a1a";
  const noseColor = "#2d2d2d";
  const pawColor = "#d4c4a8";
  const bellyColor = "#f5ebe0";
  const eyeWhite = "#ffffff";

  return (
    <group ref={groupRef} position={position}>
      {/* Body - main torso with more voxels for detail */}
      {/* Bottom layer */}
      <Voxel position={[0, 0, 0]} color={bodyColor} scale={0.6} />
      <Voxel position={[0.6, 0, 0]} color={bodyColor} scale={0.6} />
      <Voxel position={[-0.6, 0, 0]} color={bodyColor} scale={0.6} />
      <Voxel position={[0, 0, 0.4]} color={bodyColor} scale={0.5} />
      <Voxel position={[0, 0, -0.4]} color={bodyColor} scale={0.5} />
      
      {/* Middle layer */}
      <Voxel position={[0, 0.55, 0]} color={bodyColor} scale={0.6} />
      <Voxel position={[0.6, 0.55, 0]} color={bodyColor} scale={0.6} />
      <Voxel position={[-0.6, 0.55, 0]} color={bodyColor} scale={0.6} />
      <Voxel position={[0, 0.55, 0.35]} color={bellyColor} scale={0.45} />
      <Voxel position={[0, 0.55, -0.35]} color={bellyColor} scale={0.45} />
      
      {/* Top layer */}
      <Voxel position={[0, 1.05, 0]} color={bodyColor} scale={0.55} />
      <Voxel position={[0.55, 1.05, 0]} color={bodyColor} scale={0.55} />
      <Voxel position={[-0.55, 1.05, 0]} color={bodyColor} scale={0.55} />
      
      {/* Black spots on body - more detailed */}
      <Voxel position={[0.35, 0.75, 0.32]} color={spotColor} scale={0.28} />
      <Voxel position={[-0.45, 0.9, 0.32]} color={spotColor} scale={0.22} />
      <Voxel position={[0.6, 1.1, 0.28]} color={spotColor} scale={0.25} />
      <Voxel position={[-0.25, 0.3, 0.32]} color={spotColor} scale={0.2} />
      <Voxel position={[0.15, 0.85, -0.32]} color={spotColor} scale={0.3} />
      <Voxel position={[-0.5, 0.45, -0.32]} color={spotColor} scale={0.22} />
      <Voxel position={[0.45, 0.5, -0.32]} color={spotColor} scale={0.18} />
      <Voxel position={[-0.35, 1.0, -0.28]} color={spotColor} scale={0.24} />
      
      {/* Neck */}
      <Voxel position={[1.0, 0.9, 0]} color={bodyColor} scale={0.5} />
      <Voxel position={[1.0, 1.3, 0]} color={bodyColor} scale={0.45} />
      
      {/* Head group */}
      <group ref={headRef} position={[1.35, 1.1, 0]}>
        {/* Head base */}
        <Voxel position={[0, 0, 0]} color={bodyColor} scale={0.55} />
        <Voxel position={[0.4, 0, 0]} color={bodyColor} scale={0.5} />
        <Voxel position={[0, 0.45, 0]} color={bodyColor} scale={0.5} />
        <Voxel position={[0.35, 0.4, 0]} color={bodyColor} scale={0.45} />
        <Voxel position={[-0.3, 0.2, 0]} color={bodyColor} scale={0.4} />
        
        {/* Snout */}
        <Voxel position={[0.7, -0.1, 0]} color={bodyColor} scale={0.4} />
        <Voxel position={[0.95, -0.1, 0]} color={bodyColor} scale={0.35} />
        
        {/* Spot on head */}
        <Voxel position={[0.15, 0.55, 0.22]} color={spotColor} scale={0.2} />
        <Voxel position={[-0.1, 0.35, 0.25]} color={spotColor} scale={0.15} />
        
        {/* Ears */}
        <Voxel position={[-0.15, 0.75, 0.25]} color={spotColor} scale={0.25} />
        <Voxel position={[-0.15, 0.95, 0.25]} color={spotColor} scale={0.2} />
        <Voxel position={[-0.15, 0.75, -0.25]} color={bodyColor} scale={0.25} />
        <Voxel position={[-0.15, 0.95, -0.25]} color={bodyColor} scale={0.2} />
        
        {/* Nose */}
        <Voxel position={[1.15, -0.05, 0]} color={noseColor} scale={0.2} roughness={0.3} metalness={0.3} />
        
        {/* Eyes - more detailed */}
        <Voxel position={[0.55, 0.35, 0.22]} color={eyeWhite} scale={0.18} />
        <Voxel position={[0.58, 0.35, 0.26]} color={noseColor} scale={0.12} />
        <Voxel position={[0.55, 0.35, -0.22]} color={eyeWhite} scale={0.18} />
        <Voxel position={[0.58, 0.35, -0.26]} color={noseColor} scale={0.12} />
        
        {/* Mouth line */}
        <Voxel position={[0.9, -0.25, 0]} color={noseColor} scale={0.08} />
      </group>
      
      {/* Front Left Leg */}
      <group ref={frontLeftLegRef} position={[0.5, -0.2, 0.35]}>
        <Voxel position={[0, -0.15, 0]} color={bodyColor} scale={0.28} />
        <Voxel position={[0, -0.4, 0]} color={bodyColor} scale={0.26} />
        <Voxel position={[0, -0.65, 0]} color={bodyColor} scale={0.26} />
        <Voxel position={[0, -0.88, 0]} color={pawColor} scale={0.28} />
      </group>
      
      {/* Front Right Leg */}
      <group ref={frontRightLegRef} position={[0.5, -0.2, -0.35]}>
        <Voxel position={[0, -0.15, 0]} color={bodyColor} scale={0.28} />
        <Voxel position={[0, -0.4, 0]} color={spotColor} scale={0.26} />
        <Voxel position={[0, -0.65, 0]} color={bodyColor} scale={0.26} />
        <Voxel position={[0, -0.88, 0]} color={pawColor} scale={0.28} />
      </group>
      
      {/* Back Left Leg */}
      <group ref={backLeftLegRef} position={[-0.5, -0.2, 0.35]}>
        <Voxel position={[0, -0.15, 0]} color={bodyColor} scale={0.28} />
        <Voxel position={[0, -0.4, 0]} color={bodyColor} scale={0.26} />
        <Voxel position={[0, -0.65, 0]} color={spotColor} scale={0.26} />
        <Voxel position={[0, -0.88, 0]} color={pawColor} scale={0.28} />
      </group>
      
      {/* Back Right Leg */}
      <group ref={backRightLegRef} position={[-0.5, -0.2, -0.35]}>
        <Voxel position={[0, -0.15, 0]} color={bodyColor} scale={0.28} />
        <Voxel position={[0, -0.4, 0]} color={bodyColor} scale={0.26} />
        <Voxel position={[0, -0.65, 0]} color={bodyColor} scale={0.26} />
        <Voxel position={[0, -0.88, 0]} color={pawColor} scale={0.28} />
      </group>
      
      {/* Tail */}
      <group ref={tailRef} position={[-1.1, 0.7, 0]}>
        <Voxel position={[-0.15, 0.15, 0]} color={bodyColor} scale={0.22} />
        <Voxel position={[-0.3, 0.35, 0]} color={bodyColor} scale={0.2} />
        <Voxel position={[-0.4, 0.55, 0]} color={bodyColor} scale={0.18} />
        <Voxel position={[-0.45, 0.75, 0]} color={spotColor} scale={0.16} />
      </group>
    </group>
  );
}

// High-quality Voxel Pine Tree
function VoxelPineTree({ position, height = 8 }: { position: [number, number, number]; height?: number }) {
  const trunkColor = "#5c4033";
  const trunkDark = "#3d2817";
  const leavesColors = ["#1a472a", "#1e5631", "#2d6a4f", "#40916c", "#285238"];
  
  const voxels = useMemo(() => {
    const result: { pos: [number, number, number]; color: string; scale: number }[] = [];
    
    // Trunk - more detailed
    for (let y = 0; y < 4; y++) {
      result.push({ pos: [0, y * 0.5, 0], color: y % 2 === 0 ? trunkColor : trunkDark, scale: 0.5 });
      if (y > 0) {
        result.push({ pos: [0.2, y * 0.5, 0.2], color: trunkDark, scale: 0.25 });
        result.push({ pos: [-0.2, y * 0.5, -0.2], color: trunkDark, scale: 0.25 });
      }
    }
    
    // Foliage layers (cone shape) - more detailed
    const layers = Math.floor(height / 1.5);
    for (let layer = 0; layer < layers; layer++) {
      const y = 2.5 + layer * 1.0;
      const radius = Math.max(0.5, (layers - layer) * 0.8);
      
      for (let x = -radius; x <= radius; x += 0.4) {
        for (let z = -radius; z <= radius; z += 0.4) {
          const dist = Math.sqrt(x * x + z * z);
          if (dist <= radius) {
            const colorIndex = Math.floor(Math.random() * leavesColors.length);
            const color = leavesColors[colorIndex];
            const scale = 0.35 + Math.random() * 0.15;
            result.push({ pos: [x, y + Math.random() * 0.2, z], color, scale });
          }
        }
      }
    }
    
    // Top point
    result.push({ pos: [0, 2.5 + layers * 1.0 + 0.5, 0], color: leavesColors[0], scale: 0.4 });
    result.push({ pos: [0, 2.5 + layers * 1.0 + 0.9, 0], color: leavesColors[1], scale: 0.3 });
    
    return result;
  }, [height]);

  return (
    <group position={position}>
      {voxels.map((v, i) => (
        <Voxel key={i} position={v.pos} color={v.color} scale={v.scale} roughness={0.9} />
      ))}
    </group>
  );
}

// High-quality ground with texture variation
function VoxelGround() {
  const groundVoxels = useMemo(() => {
    const result: { pos: [number, number, number]; color: string; scale: number }[] = [];
    const grassColors = ["#2d5a3a", "#3a6b4a", "#4a7c5a", "#1a472a", "#2a5535", "#3d7a4f"];
    const dirtColors = ["#5c4033", "#6b4f3a", "#7a5d45"];
    
    // Create detailed ground tiles
    for (let x = -50; x <= 50; x += 1.5) {
      for (let z = -15; z <= 15; z += 1.5) {
        const isGrass = Math.random() > 0.1;
        const colors = isGrass ? grassColors : dirtColors;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const yOffset = (Math.random() - 0.5) * 0.15;
        result.push({ 
          pos: [x + (Math.random() - 0.5) * 0.5, -2.3 + yOffset, z + (Math.random() - 0.5) * 0.5], 
          color,
          scale: 0.8 + Math.random() * 0.4
        });
      }
    }
    return result;
  }, []);

  return (
    <group>
      {/* Base ground plane */}
      <mesh position={[0, -2.7, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[250, 60]} />
        <meshStandardMaterial color="#2d5a3a" roughness={1} />
      </mesh>
      
      {/* Detailed voxel ground */}
      {groundVoxels.map((v, i) => (
        <Voxel key={i} position={v.pos} color={v.color} scale={v.scale} roughness={1} />
      ))}
    </group>
  );
}

// Grass blades for extra detail
function GrassBlades({ offset }: { offset: number }) {
  const blades = useMemo(() => {
    const result: { pos: [number, number, number]; color: string; height: number }[] = [];
    const colors = ["#3d7a4f", "#4a8c5a", "#5a9c6a", "#2d6a3f"];
    
    for (let i = 0; i < 200; i++) {
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 25;
      result.push({
        pos: [x, -2.1, z],
        color: colors[Math.floor(Math.random() * colors.length)],
        height: 0.2 + Math.random() * 0.3
      });
    }
    return result;
  }, []);

  return (
    <group position={[offset, 0, 0]}>
      {blades.map((blade, i) => (
        <mesh key={i} position={blade.pos}>
          <boxGeometry args={[0.05, blade.height, 0.05]} />
          <meshStandardMaterial color={blade.color} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Flowers and small details
function FlowerDetails({ offset }: { offset: number }) {
  const flowers = useMemo(() => {
    const result: { pos: [number, number, number]; color: string }[] = [];
    const colors = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff9a9e", "#fad0c4"];
    
    for (let i = 0; i < 50; i++) {
      const x = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 25;
      result.push({
        pos: [x, -2.0, z],
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    return result;
  }, []);

  return (
    <group position={[offset, 0, 0]}>
      {flowers.map((flower, i) => (
        <mesh key={i} position={flower.pos}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color={flower.color} roughness={0.5} emissive={flower.color} emissiveIntensity={0.1} />
        </mesh>
      ))}
    </group>
  );
}

// Forest environment that scrolls past
function ForestEnvironment({ offset }: { offset: number }) {
  const trees = useMemo(() => {
    const result: { x: number; z: number; height: number }[] = [];
    for (let i = 0; i < 80; i++) {
      const x = (i - 40) * 3.5 + (Math.random() - 0.5) * 2;
      const zSide = Math.random() > 0.5 ? 1 : -1;
      const z = zSide * (3.5 + Math.random() * 10);
      result.push({ x, z, height: 5 + Math.random() * 5 });
    }
    // Add some trees further back for depth
    for (let i = 0; i < 40; i++) {
      const x = (i - 20) * 7 + (Math.random() - 0.5) * 3;
      const zSide = Math.random() > 0.5 ? 1 : -1;
      const z = zSide * (12 + Math.random() * 6);
      result.push({ x, z, height: 7 + Math.random() * 4 });
    }
    return result;
  }, []);

  return (
    <group position={[offset, 0, 0]}>
      {trees.map((tree, i) => (
        <VoxelPineTree 
          key={i} 
          position={[tree.x, -1.5, tree.z]} 
          height={tree.height}
        />
      ))}
    </group>
  );
}

// Animated scene with dog walking and forest scrolling
function AnimatedScene() {
  const forestRef = useRef<THREE.Group>(null);
  const grassRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const elapsedTime = clock.getElapsedTime();
    const loopTime = elapsedTime % 10;
    const progress = loopTime / 10;
    
    if (forestRef.current) {
      forestRef.current.position.x = -progress * 70;
    }
    if (grassRef.current) {
      grassRef.current.position.x = -progress * 70;
    }
  });

  return (
    <group>
      {/* Static ground base */}
      <VoxelGround />
      
      {/* Scrolling grass and flowers */}
      <group ref={grassRef}>
        <GrassBlades offset={0} />
        <GrassBlades offset={70} />
        <FlowerDetails offset={0} />
        <FlowerDetails offset={70} />
      </group>
      
      {/* Moving forest */}
      <group ref={forestRef}>
        <ForestEnvironment offset={0} />
        <ForestEnvironment offset={70} />
      </group>
      
      {/* Dog stays in place, facing right */}
      <VoxelDog position={[0, 0.15, 0]} />
    </group>
  );
}

// Improved Sky with gradient
function Sky() {
  return (
    <group>
      {/* Sky dome effect */}
      <mesh position={[0, 30, -80]}>
        <sphereGeometry args={[100, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#5fa8d3" side={THREE.BackSide} />
      </mesh>
      
      {/* Horizon glow */}
      <mesh position={[0, 0, -60]} rotation={[0, 0, 0]}>
        <planeGeometry args={[300, 80]} />
        <meshBasicMaterial color="#a8d5e5" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// Better Sun with glow
function Sun() {
  return (
    <group position={[40, 30, -50]}>
      {/* Sun core */}
      <mesh>
        <sphereGeometry args={[6, 32, 32]} />
        <meshBasicMaterial color="#fff9c4" />
      </mesh>
      {/* Sun glow */}
      <mesh>
        <sphereGeometry args={[8, 32, 32]} />
        <meshBasicMaterial color="#ffeb3b" transparent opacity={0.3} />
      </mesh>
      <mesh>
        <sphereGeometry args={[12, 32, 32]} />
        <meshBasicMaterial color="#ffd54f" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

// Improved clouds with more detail
function VoxelCloud({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const cloudVoxels = useMemo(() => {
    const result: { pos: [number, number, number]; s: number }[] = [];
    const basePositions = [
      [0, 0, 0], [1.2, 0, 0], [-1.2, 0, 0], [0.6, 0.6, 0], [-0.6, 0.5, 0],
      [1.6, 0.2, 0], [-1.6, 0.1, 0], [0, 0.4, 0.3], [0, 0.4, -0.3],
      [0.8, 0.3, 0.2], [-0.8, 0.3, -0.2], [2, 0, 0], [-2, 0.1, 0]
    ];
    
    basePositions.forEach(pos => {
      result.push({ 
        pos: [pos[0], pos[1], pos[2]] as [number, number, number], 
        s: 0.8 + Math.random() * 0.6 
      });
    });
    
    return result;
  }, []);

  return (
    <group position={position} scale={scale}>
      {cloudVoxels.map((v, i) => (
        <mesh key={i} position={v.pos} castShadow>
          <boxGeometry args={[v.s, v.s * 0.6, v.s * 0.8]} />
          <meshStandardMaterial color="#ffffff" roughness={1} emissive="#ffffff" emissiveIntensity={0.1} />
        </mesh>
      ))}
    </group>
  );
}

function AnimatedClouds() {
  const cloudsRef = useRef<THREE.Group>(null);
  
  const cloudData = useMemo(() => [
    { pos: [-20, 15, -25] as [number, number, number], scale: 1.2 },
    { pos: [15, 18, -30] as [number, number, number], scale: 1.5 },
    { pos: [40, 14, -22] as [number, number, number], scale: 1.0 },
    { pos: [-35, 16, -28] as [number, number, number], scale: 1.3 },
    { pos: [5, 20, -35] as [number, number, number], scale: 1.8 },
    { pos: [60, 17, -26] as [number, number, number], scale: 1.1 },
    { pos: [-50, 19, -32] as [number, number, number], scale: 1.4 },
  ], []);

  useFrame(({ clock }) => {
    if (cloudsRef.current) {
      cloudsRef.current.position.x = Math.sin(clock.getElapsedTime() * 0.05) * 5;
    }
  });

  return (
    <group ref={cloudsRef}>
      {cloudData.map((cloud, i) => (
        <VoxelCloud key={i} position={cloud.pos} scale={cloud.scale} />
      ))}
    </group>
  );
}

// Birds for extra atmosphere
function Birds() {
  const birdsRef = useRef<THREE.Group>(null);
  
  const birdPositions = useMemo(() => 
    Array.from({ length: 5 }, () => [
      (Math.random() - 0.5) * 60,
      12 + Math.random() * 8,
      -15 - Math.random() * 10
    ] as [number, number, number])
  , []);

  useFrame(({ clock }) => {
    if (birdsRef.current) {
      birdsRef.current.children.forEach((bird, i) => {
        bird.position.x += 0.02;
        bird.position.y += Math.sin(clock.getElapsedTime() * 3 + i) * 0.01;
        if (bird.position.x > 50) bird.position.x = -50;
      });
    }
  });

  return (
    <group ref={birdsRef}>
      {birdPositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.3, 0.1, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  );
}

// Post-processing effects
function Effects() {
  return (
    <EffectComposer>
      <SMAA />
      <Bloom 
        luminanceThreshold={0.9}
        luminanceSmoothing={0.9}
        intensity={0.3}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.3} darkness={0.4} />
    </EffectComposer>
  );
}

export function App() {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-sky-400 to-sky-200 overflow-hidden">
      <Canvas
        camera={{ position: [2, 2.5, 12], fov: 45 }}
        shadows
        dpr={[1, 2]}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
          powerPreference: "high-performance"
        }}
      >
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.4} color="#b8d4e3" />
        
        {/* Main sun light with shadows */}
        <directionalLight 
          position={[30, 40, 20]} 
          intensity={1.8} 
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
          shadow-bias={-0.0001}
          color="#fff5e6"
        />
        
        {/* Fill light */}
        <directionalLight 
          position={[-20, 10, -10]} 
          intensity={0.3} 
          color="#a8c5d9"
        />
        
        {/* Rim light for the dog */}
        <pointLight position={[-5, 3, 0]} intensity={0.5} color="#ffecd2" distance={15} />
        
        {/* Ground bounce light */}
        <pointLight position={[0, -1, 5]} intensity={0.2} color="#7ab87a" distance={10} />
        
        {/* Hemisphere light for natural sky lighting */}
        <hemisphereLight args={['#87ceeb', '#3d7a4f', 0.4]} />
        
        {/* Background elements */}
        <Sky />
        <Sun />
        <AnimatedClouds />
        <Birds />
        
        {/* Main animated scene */}
        <AnimatedScene />
        
        {/* Atmospheric fog */}
        <fog attach="fog" args={['#a8d5e5', 25, 80]} />
        
        {/* Post-processing */}
        <Effects />
      </Canvas>
      
    </div>
  );
}
