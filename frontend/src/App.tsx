import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Earth } from './components/Earth';
import { InstancedContainers } from './components/InstancedContainers';
import { GreatCircleRoute } from './components/GreatCircleRoute';
import { useWebSocket } from './hooks/useWebSocket';
import './App.css';

// Helper functions for display
function formatSimTime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) {
    return `${days}d ${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m ${Math.floor(seconds % 60)}s`;
}

function avgQuality(containers: { quality: number }[]): number {
  if (containers.length === 0) return 100;
  return containers.reduce((sum, c) => sum + c.quality, 0) / containers.length;
}

function avgTemp(containers: { current_temp: number }[]): number {
  if (containers.length === 0) return 0;
  return containers.reduce((sum, c) => sum + c.current_temp, 0) / containers.length;
}

function getQualityColor(quality: number): string {
  if (quality >= 90) return '#4caf50'; // Green
  if (quality >= 70) return '#ffeb3b'; // Yellow
  if (quality >= 50) return '#ff9800'; // Orange
  return '#f44336'; // Red
}

function getTempColor(temp: number): string {
  if (temp <= 2) return '#4caf50'; // Good (cold)
  if (temp <= 5) return '#ffeb3b'; // Warning
  return '#f44336'; // Danger (too warm)
}

function App() {
  const WS_URL = 'ws://localhost:3000/ws';
  const { worldState, connectionStatus } = useWebSocket(WS_URL);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      {/* Connection status indicator */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 1000,
          padding: '10px 20px',
          borderRadius: '5px',
          backgroundColor: connectionStatus === 'connected' ? '#4caf50' : '#f44336',
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        {connectionStatus === 'connected' ? '● Connected' : '● Disconnected'}
      </div>

      {/* Simulation info panel */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 1000,
          padding: '15px 20px',
          borderRadius: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          fontFamily: 'monospace',
          fontSize: '14px',
          minWidth: '220px',
        }}
      >
        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '10px', borderBottom: '1px solid #444', paddingBottom: '8px' }}>
          CherryChain Simulation
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ color: '#888' }}>Containers:</span> {worldState.containers.length}
        </div>
        <div style={{ marginBottom: '4px' }}>
          <span style={{ color: '#888' }}>Sim Time:</span> {formatSimTime(worldState.sim_time)}
        </div>
        {worldState.containers.length > 0 && (
          <>
            <div style={{ marginTop: '10px', borderTop: '1px solid #444', paddingTop: '8px' }}>
              <div style={{ color: '#888', marginBottom: '4px' }}>Average Stats:</div>
              <div style={{ marginBottom: '2px' }}>
                <span style={{ color: '#888' }}>Quality:</span>{' '}
                <span style={{ color: getQualityColor(avgQuality(worldState.containers)) }}>
                  {avgQuality(worldState.containers).toFixed(1)}%
                </span>
              </div>
              <div>
                <span style={{ color: '#888' }}>Temp:</span>{' '}
                <span style={{ color: getTempColor(avgTemp(worldState.containers)) }}>
                  {avgTemp(worldState.containers).toFixed(1)}°C
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3D Scene */}
      <Canvas camera={{ position: [2, 1, 2.5], fov: 60 }}>
        {/* Ambient light for base illumination */}
        <ambientLight intensity={0.3} />
        {/* Directional light simulating sun */}
        <directionalLight
          position={[5, 3, 5]}
          intensity={1.5}
          color="#fff5e6"
          castShadow
        />
        {/* Soft fill light from opposite side */}
        <directionalLight
          position={[-3, -1, -2]}
          intensity={0.3}
          color="#4a6fa5"
        />
        {/* Subtle hemisphere light for natural look */}
        <hemisphereLight
          color="#ffffff"
          groundColor="#444444"
          intensity={0.4}
        />

        {/* Stars background */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* Earth with suspense for texture loading */}
        <Suspense fallback={
          <mesh>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color="#2a4d69" />
          </mesh>
        }>
          <Earth />
        </Suspense>

        {/* Great Circle shipping route */}
        <GreatCircleRoute />

        {/* Instanced containers for high performance (1000+) */}
        <InstancedContainers containers={worldState.containers} />

        {/* Camera controls */}
        <OrbitControls enablePan={false} minDistance={1.5} maxDistance={5} />
      </Canvas>
    </div>
  );
}

export default App;
