import { Canvas } from "@react-three/fiber";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import { CreditCard3D } from "./3d/CreditCard3D";

interface Scene3DProps {
  scrollProgress: number;
}

export function Scene3D({ scrollProgress }: Scene3DProps) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />

        {/* Enhanced Lighting for premium look */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />

        {/* Yellow glow lights */}
        <pointLight
          position={[-4, 3, 3]}
          intensity={1.2}
          color="#fbe304"
          distance={10}
        />
        <pointLight
          position={[4, 3, 3]}
          intensity={1}
          color="#fbe304"
          distance={10}
        />
        <pointLight
          position={[0, -3, 3]}
          intensity={0.8}
          color="#fbe304"
          distance={8}
        />

        {/* Spotlight for dramatic effect */}
        <spotLight
          position={[0, 8, 5]}
          angle={0.4}
          penumbra={1}
          intensity={1.2}
          castShadow
          color="#fbe304"
        />

        {/* Credit Card - centerpiece */}
        <CreditCard3D scrollProgress={scrollProgress} />

        {/* Environment for metallic reflections */}
        <Environment preset="city" />

        {/* Atmospheric fog */}
        <fog attach="fog" args={["#3b3c44", 8, 20]} />
      </Canvas>
    </div>
  );
}
