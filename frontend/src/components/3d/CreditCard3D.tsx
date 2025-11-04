import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

interface CreditCard3DProps {
  scrollProgress: number;
}

export function CreditCard3D({ scrollProgress }: CreditCard3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cardRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current || !cardRef.current) return;

    // Idle animation: gentle float and rotation
    const time = state.clock.getElapsedTime();
    const idleFloat = Math.sin(time * 0.5) * 0.1;
    const idleRotation = Math.sin(time * 0.3) * 0.05;

    // Scroll-based animation
    const scrollY = scrollProgress * 6; // Scale scroll effect
    const scrollRotation = scrollProgress * Math.PI * 0.5;

    // Combine idle and scroll animations
    groupRef.current.position.y = idleFloat - scrollY * 2;
    groupRef.current.rotation.y = idleRotation + scrollProgress * Math.PI * 2;
    groupRef.current.rotation.x = scrollProgress * 0.3;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Credit Card */}
      <RoundedBox
        ref={cardRef}
        args={[3.5, 2.2, 0.1]}
        radius={0.15}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#fbe304"
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={1.5}
        />
      </RoundedBox>

      {/* Card chip */}
      <RoundedBox
        args={[0.5, 0.4, 0.05]}
        radius={0.05}
        position={[-1, 0.5, 0.06]}
        castShadow
      >
        <meshStandardMaterial
          color="#928915"
          metalness={0.9}
          roughness={0.1}
        />
      </RoundedBox>

      {/* Card stripe */}
      <mesh position={[0, 0.8, 0.06]}>
        <boxGeometry args={[3.5, 0.3, 0.01]} />
        <meshStandardMaterial color="#3b3c44" />
      </mesh>

      {/* Card details (small rectangles) */}
      <mesh position={[-0.5, -0.3, 0.06]}>
        <boxGeometry args={[2, 0.15, 0.01]} />
        <meshStandardMaterial color="#3b3c44" opacity={0.6} transparent />
      </mesh>

      <mesh position={[-0.5, -0.6, 0.06]}>
        <boxGeometry args={[1.5, 0.15, 0.01]} />
        <meshStandardMaterial color="#3b3c44" opacity={0.6} transparent />
      </mesh>
    </group>
  );
}
