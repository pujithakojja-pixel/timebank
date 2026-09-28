import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';

// Individual node (person in network)
function Node({ position, color, scale = 1 }) {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8 + position[0]) * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 1.2 + position[0]) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.18 * scale, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      {/* Core sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.10 * scale, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}

// Animated connection line between nodes
function Connection({ start, end, color, animated = true }) {
  const ref = useRef();
  const particleRef = useRef();

  useFrame((state) => {
    if (particleRef.current && animated) {
      const t = (Math.sin(state.clock.elapsedTime * 0.6) * 0.5 + 0.5);
      const x = start[0] + (end[0] - start[0]) * t;
      const y = start[1] + (end[1] - start[1]) * t;
      const z = start[2] + (end[2] - start[2]) * t;
      particleRef.current.position.set(x, y, z);
    }
  });

  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], []);

  return (
    <group>
      <Line
        points={points}
        color={color}
        lineWidth={1}
        transparent
        opacity={0.25}
      />
      {animated && (
        <mesh ref={particleRef}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>
      )}
    </group>
  );
}

// Background particle field
function ParticleField() {
  const count = 300;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  const pointsRef = useRef();
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#6C63FF" size={0.02} sizeAttenuation depthWrite={false} opacity={0.4} />
    </Points>
  );
}

// Main network graph
function NetworkGraph() {
  const groupRef = useRef();
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const nodes = [
    { position: [0, 0, 0], color: '#6C63FF', scale: 1.5 },
    { position: [2.5, 1, 0.5], color: '#00D4FF', scale: 1.2 },
    { position: [-2.5, 0.5, -0.5], color: '#FF6B9D', scale: 1.2 },
    { position: [1.5, -1.5, 1], color: '#00FFB3', scale: 1 },
    { position: [-1.5, -1, -1.5], color: '#FF8A65', scale: 1 },
    { position: [0.5, 2.2, -1], color: '#6C63FF', scale: 0.9 },
    { position: [-0.5, 1.8, 1.5], color: '#00D4FF', scale: 0.8 },
    { position: [3, -0.5, -1], color: '#FF6B9D', scale: 0.8 },
  ];

  const connections = [
    { start: nodes[0].position, end: nodes[1].position, color: '#6C63FF' },
    { start: nodes[0].position, end: nodes[2].position, color: '#00D4FF' },
    { start: nodes[0].position, end: nodes[3].position, color: '#FF6B9D' },
    { start: nodes[1].position, end: nodes[5].position, color: '#00D4FF' },
    { start: nodes[1].position, end: nodes[7].position, color: '#00D4FF' },
    { start: nodes[2].position, end: nodes[4].position, color: '#FF6B9D' },
    { start: nodes[2].position, end: nodes[6].position, color: '#FF6B9D' },
    { start: nodes[3].position, end: nodes[4].position, color: '#00FFB3' },
    { start: nodes[5].position, end: nodes[6].position, color: '#6C63FF' },
    { start: nodes[6].position, end: nodes[0].position, color: '#6C63FF' },
  ];

  return (
    <group ref={groupRef}>
      {connections.map((conn, i) => (
        <Connection key={i} {...conn} animated={i < 5} />
      ))}
      {nodes.map((node, i) => (
        <Node key={i} {...node} />
      ))}
    </group>
  );
}

export default function NetworkScene({ style = {} }) {
  return (
    <div style={{ width: '100%', height: '100%', ...style }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} color="#6C63FF" intensity={2} />
          <pointLight position={[-5, -5, 5]} color="#00D4FF" intensity={1.5} />
          <ParticleField />
          <NetworkGraph />
        </Suspense>
      </Canvas>
    </div>
  );
}
