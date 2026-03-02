
import React, { useRef } from 'react';
import { useFrame ,useLoader} from '@react-three/fiber';
import { Mesh, Group } from 'three';
import { useIsMobile } from '@/hooks/use-mobile';
import { RoundedBox } from '@react-three/drei';
import { TextureLoader } from 'three';
interface SmartphoneModelProps {
  rotation?: [number, number, number];
  position?: [number, number, number];
  scale?: number;
}

export default function SmartphoneModel({
  rotation = [0, 0, 0],
  position = [0, 0, 0],
  scale = 1.5
}: SmartphoneModelProps) {
  // const appMockupRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);
  const phoneBodyRef = useRef<Mesh>(null);
  const screenRef = useRef<Mesh>(null);
  const logoRef = useRef<Mesh>(null);
  const appMockupRef = useRef<Mesh>(null);
  const cameraRef = useRef<Mesh>(null);
  const isMobile = useIsMobile();
  const appMockupTexture = useLoader(TextureLoader, '/PicsArt.png'); 
  // Animations for different parts of the phone
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Main phone group animation
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.2;
      groupRef.current.position.y = Math.sin(t * 0.7) * 0.1;
    }

    // Phone body subtle pulse
    if (phoneBodyRef.current) {
      phoneBodyRef.current.scale.x = 1 + Math.sin(t * 0.8) * 0.01;
      phoneBodyRef.current.scale.y = 1 + Math.sin(t * 0.8) * 0.01;
    }

    // Screen glow effect
    if (screenRef.current && screenRef.current.material) {
      (screenRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.2 + Math.sin(t * 1.2) * 0.1;
    }

    // Logo bounce
    if (logoRef.current) {
      logoRef.current.position.y = 0.5 + Math.sin(t * 2) * 0.03;
    }

    // App mockup animation
    if (appMockupRef.current) {
      appMockupRef.current.rotation.z = Math.sin(t * 0.3) * 0.05;
    }

    // Camera lens subtle rotation
    if (cameraRef.current) {
      cameraRef.current.rotation.z = t * 0.5;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position as any}
      rotation={rotation as any}
      scale={isMobile ? scale * 0.7 : scale}
    >
      {/* Simple phone model created with primitives */}
      <group>
        {/* Phone body */}
        {/* <mesh ref={phoneBodyRef} castShadow receiveShadow>
          <boxGeometry args={[0.9, 1.8, 0.1]} />
          <meshStandardMaterial color="blue" />
        </mesh> */}
  <RoundedBox
          ref={phoneBodyRef}
          args={[0.9, 1.8, 0.1]} // Width, height, depth
          radius={0.05} // Corner radius
          smoothness={4} // Smoothness of the corners
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color="blue" />
        </RoundedBox>
        {/* Screen */}
        <mesh ref={screenRef} position={[0, 0, 0.051]}>
          <boxGeometry args={[0.8, 1.7, 0.001]} />
          <meshStandardMaterial color="#111" emissive="#444" emissiveIntensity={0.2} />
        </mesh>


        {/* Screen content - app mockup */}
        <mesh ref={appMockupRef} position={[0, 0, 0.052]}>
          <planeGeometry args={[0.8, 1.7]} /> 
          <meshBasicMaterial map={appMockupTexture} />
        </mesh>

        {/* Camera */}
        <mesh ref={cameraRef} position={[0, 0.8, 0.051]}>
          <cylinderGeometry args={[0.04, 0.04, 0.01, 16]} />
          <meshStandardMaterial color="#000" />
        </mesh>
      </group>
    </group>
  );
}
