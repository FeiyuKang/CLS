import { useRef } from 'react';
import { Mesh } from 'three';

interface ContainerProps {
  position: [number, number, number];
}

export function Container({ position }: ContainerProps) {
  const meshRef = useRef<Mesh>(null);

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.05, 0.05, 0.05]} />
      <meshStandardMaterial color="#ff6b35" />
    </mesh>
  );
}
