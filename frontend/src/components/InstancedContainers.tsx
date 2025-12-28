import { useRef, useMemo, useEffect } from 'react';
import {
  InstancedMesh,
  Object3D,
  Color,
  BoxGeometry,
  MeshStandardMaterial,
  InstancedBufferAttribute,
} from 'three';
import { useFrame } from '@react-three/fiber';
import { latLonToCartesian } from '../utils/coordinates';

interface ContainerData {
  id: number;
  position: { lat: number; lon: number };
  quality: number;
  current_temp: number;
  target_temp: number;
}

interface InstancedContainersProps {
  containers: ContainerData[];
  radius?: number;
}

// Helper to interpolate color based on quality (100% = green, 50% = yellow, 0% = red)
function getQualityColor(quality: number): Color {
  const q = Math.max(0, Math.min(100, quality)) / 100;

  if (q > 0.5) {
    // Green to Yellow (100% -> 50%)
    const t = (q - 0.5) * 2; // 0 to 1
    return new Color().setRGB(1 - t, 1, 0); // Yellow to Green
  } else {
    // Yellow to Red (50% -> 0%)
    const t = q * 2; // 0 to 1
    return new Color().setRGB(1, t, 0); // Red to Yellow
  }
}

// Dummy object for matrix calculations
const dummy = new Object3D();

export function InstancedContainers({ containers, radius = 1.05 }: InstancedContainersProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const prevCountRef = useRef(0);

  // Create geometry and material once
  const [geometry, material] = useMemo(() => {
    const geo = new BoxGeometry(0.02, 0.01, 0.03); // Container proportions
    const mat = new MeshStandardMaterial({
      roughness: 0.6,
      metalness: 0.3,
    });
    return [geo, mat];
  }, []);

  // Pre-calculate instance colors array
  const colorArray = useMemo(() => {
    const colors = new Float32Array(Math.max(1000, containers.length) * 3);
    return colors;
  }, [containers.length]);

  // Update instance matrices and colors
  useEffect(() => {
    if (!meshRef.current) return;

    const mesh = meshRef.current;

    containers.forEach((container, i) => {
      // Calculate 3D position from lat/lon
      const [x, y, z] = latLonToCartesian(
        container.position.lat,
        container.position.lon,
        radius
      );

      // Set position
      dummy.position.set(x, y, z);

      // Orient container to face outward from Earth center
      dummy.lookAt(0, 0, 0);
      dummy.rotateX(Math.PI / 2); // Adjust orientation

      // Small scale variation based on ID for visual interest
      const scaleVar = 0.8 + (container.id % 5) * 0.1;
      dummy.scale.setScalar(scaleVar);

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Set color based on quality
      const color = getQualityColor(container.quality);
      colorArray[i * 3] = color.r;
      colorArray[i * 3 + 1] = color.g;
      colorArray[i * 3 + 2] = color.b;
    });

    // Update instance matrix buffer
    mesh.instanceMatrix.needsUpdate = true;

    // Update instance colors
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    } else {
      mesh.instanceColor = new InstancedBufferAttribute(colorArray, 3);
    }

    mesh.count = containers.length;
    prevCountRef.current = containers.length;
  }, [containers, radius, colorArray]);

  // Optional: Add subtle animation
  useFrame((state) => {
    if (!meshRef.current || containers.length === 0) return;

    // Subtle bobbing animation for containers
    const time = state.clock.elapsedTime;
    const mesh = meshRef.current;

    // Only update a subset for performance
    const updateCount = Math.min(containers.length, 100);
    for (let i = 0; i < updateCount; i++) {
      const container = containers[i];
      const [x, y, z] = latLonToCartesian(
        container.position.lat,
        container.position.lon,
        radius + 0.002 * Math.sin(time * 2 + i)
      );

      dummy.position.set(x, y, z);
      dummy.lookAt(0, 0, 0);
      dummy.rotateX(Math.PI / 2);

      const scaleVar = 0.8 + (container.id % 5) * 0.1;
      dummy.scale.setScalar(scaleVar);

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  // Max instance count for buffer allocation
  const maxInstances = Math.max(1000, containers.length);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, maxInstances]}
      frustumCulled={false}
    />
  );
}
