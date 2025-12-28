import { useMemo, useRef } from 'react';
import { Line } from '@react-three/drei';
import { Vector3, Group } from 'three';
import { useFrame } from '@react-three/fiber';
import { latLonToCartesian } from '../utils/coordinates';

// Route endpoints
const CHILE_COORDS = { lat: -33.0, lon: -71.0 }; // Valparaíso, Chile
const CHINA_COORDS = { lat: 31.0, lon: 121.0 };  // Shanghai, China

interface GreatCircleRouteProps {
  segments?: number;
  radius?: number;
  animated?: boolean;
}

/**
 * Calculate intermediate point on a great circle using spherical interpolation
 */
function interpolateGreatCircle(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  t: number
): { lat: number; lon: number } {
  // Convert to radians
  const phi1 = (lat1 * Math.PI) / 180;
  const lambda1 = (lon1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const lambda2 = (lon2 * Math.PI) / 180;

  // Calculate angular distance using haversine formula
  const dLambda = lambda2 - lambda1;
  const cosD =
    Math.sin(phi1) * Math.sin(phi2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  const d = Math.acos(Math.max(-1, Math.min(1, cosD)));

  if (Math.abs(d) < 0.0001) {
    return { lat: lat1, lon: lon1 };
  }

  // Spherical linear interpolation (slerp)
  const sinD = Math.sin(d);
  const a = Math.sin((1 - t) * d) / sinD;
  const b = Math.sin(t * d) / sinD;

  // Cartesian coordinates of interpolated point
  const x = a * Math.cos(phi1) * Math.cos(lambda1) + b * Math.cos(phi2) * Math.cos(lambda2);
  const y = a * Math.cos(phi1) * Math.sin(lambda1) + b * Math.cos(phi2) * Math.sin(lambda2);
  const z = a * Math.sin(phi1) + b * Math.sin(phi2);

  // Convert back to lat/lon
  const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * (180 / Math.PI);
  const lon = Math.atan2(y, x) * (180 / Math.PI);

  return { lat, lon };
}

/**
 * Generate points along a great circle route
 */
function generateGreatCirclePoints(
  start: { lat: number; lon: number },
  end: { lat: number; lon: number },
  segments: number,
  radius: number
): Vector3[] {
  const points: Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const { lat, lon } = interpolateGreatCircle(
      start.lat,
      start.lon,
      end.lat,
      end.lon,
      t
    );
    const [x, y, z] = latLonToCartesian(lat, lon, radius);
    points.push(new Vector3(x, y, z));
  }

  return points;
}

export function GreatCircleRoute({
  segments = 100,
  radius = 1.01, // Slightly above Earth surface
  animated = true,
}: GreatCircleRouteProps) {
  const groupRef = useRef<Group>(null);

  // Generate main route points
  const routePoints = useMemo(
    () => generateGreatCirclePoints(CHILE_COORDS, CHINA_COORDS, segments, radius),
    [segments, radius]
  );

  // Generate elevated arc for visual effect (higher in the middle)
  const arcPoints = useMemo(() => {
    const points: Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const { lat, lon } = interpolateGreatCircle(
        CHILE_COORDS.lat,
        CHILE_COORDS.lon,
        CHINA_COORDS.lat,
        CHINA_COORDS.lon,
        t
      );
      // Add elevation in the middle of the journey
      const elevation = 0.08 * Math.sin(t * Math.PI);
      const [x, y, z] = latLonToCartesian(lat, lon, radius + elevation);
      points.push(new Vector3(x, y, z));
    }
    return points;
  }, [segments, radius]);

  // Animate glow effect
  useFrame((state) => {
    if (groupRef.current && animated) {
      // Subtle pulsing effect
      const pulse = 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 2);
      groupRef.current.children.forEach((child) => {
        const obj = child as { material?: { opacity?: number } };
        if (obj.material && typeof obj.material.opacity === 'number') {
          obj.material.opacity = 0.3 + 0.4 * pulse;
        }
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main route line (on surface) */}
      <Line
        points={routePoints}
        color="#ff4444"
        lineWidth={2}
        transparent
        opacity={0.6}
      />

      {/* Elevated arc line (shipping lane visualization) */}
      <Line
        points={arcPoints}
        color="#ffaa00"
        lineWidth={1.5}
        transparent
        opacity={0.4}
        dashed
        dashScale={50}
        dashSize={0.02}
        dashOffset={0}
      />

      {/* Glow effect line (wider, more transparent) */}
      <Line
        points={routePoints}
        color="#ff6666"
        lineWidth={6}
        transparent
        opacity={0.15}
      />

      {/* Start point marker (Chile) */}
      <mesh position={latLonToCartesian(CHILE_COORDS.lat, CHILE_COORDS.lon, radius + 0.02)}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color="#00ff00" />
      </mesh>

      {/* End point marker (China) */}
      <mesh position={latLonToCartesian(CHINA_COORDS.lat, CHINA_COORDS.lon, radius + 0.02)}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
    </group>
  );
}

// Export utility function for use elsewhere
export { interpolateGreatCircle, generateGreatCirclePoints };
