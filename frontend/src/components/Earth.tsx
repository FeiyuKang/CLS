import { useRef, useMemo } from 'react';
import { Mesh, TextureLoader, SRGBColorSpace, AdditiveBlending, BackSide } from 'three';
import { useFrame, useLoader } from '@react-three/fiber';

// NASA Blue Marble texture URLs (public domain)
const EARTH_TEXTURE_URL = 'https://unpkg.com/three-globe@2.31.3/example/img/earth-blue-marble.jpg';
const EARTH_BUMP_URL = 'https://unpkg.com/three-globe@2.31.3/example/img/earth-topology.png';

export function Earth() {
  const meshRef = useRef<Mesh>(null);
  const cloudsRef = useRef<Mesh>(null);
  const atmosphereRef = useRef<Mesh>(null);

  // Load textures
  const [earthTexture, bumpTexture] = useLoader(TextureLoader, [
    EARTH_TEXTURE_URL,
    EARTH_BUMP_URL,
  ]);

  // Configure texture color space
  useMemo(() => {
    if (earthTexture) {
      earthTexture.colorSpace = SRGBColorSpace;
    }
  }, [earthTexture]);

  // Slow rotation for visual interest
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02 * delta; // Slower, smoother rotation
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.025 * delta; // Clouds rotate slightly faster
    }
  });

  return (
    <group>
      {/* Main Earth sphere with texture */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          bumpMap={bumpTexture}
          bumpScale={0.02}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Atmosphere glow effect */}
      <mesh ref={atmosphereRef} scale={1.015}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#4da6ff"
          transparent
          opacity={0.15}
          side={BackSide}
          blending={AdditiveBlending}
        />
      </mesh>

      {/* Subtle cloud layer (semi-transparent white sphere) */}
      <mesh ref={cloudsRef} scale={1.005}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.08}
          roughness={1}
        />
      </mesh>
    </group>
  );
}
