import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface StockArrow3DProps {
  position: [number, number, number];
  isGreen: boolean;
  scrollProgress: number;
  delay: number;
}

export function StockArrow3D({ position, isGreen, scrollProgress, delay }: StockArrow3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Oscillating movement (up and down)
    const oscillation = Math.sin(time * 1.5 + delay) * 0.5;
    
    // Slower parallax movement based on scroll
    const scrollOffset = scrollProgress * 3;

    groupRef.current.position.y = position[1] + oscillation - scrollOffset;
    groupRef.current.rotation.z = Math.sin(time * 0.5 + delay) * 0.1;
  });

  const color = isGreen ? '#22c55e' : '#ef4444';
  const arrowDirection = isGreen ? 1 : -1;

  return (
    <group ref={groupRef} position={position}>
      {/* Arrow shaft */}
      <mesh>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Arrow head */}
      <mesh position={[0, arrowDirection * 0.6, 0]} rotation={[0, 0, arrowDirection === 1 ? 0 : Math.PI]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      {/* Glow effect */}
      <pointLight
        color={color}
        intensity={0.5}
        distance={2}
        decay={2}
      />
    </group>
  );
}
