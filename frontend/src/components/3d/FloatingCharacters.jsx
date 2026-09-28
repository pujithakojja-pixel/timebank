import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

/* ── individual floating emoji billboard ── */
function EmojiSprite({ emoji, position, speed = 1, rotSpeed = 0.3, scale = 1 }) {
  const ref = useRef();
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.y = position[1] + Math.sin(t * speed + offset) * 0.4;
    ref.current.position.x = position[0] + Math.cos(t * speed * 0.6 + offset) * 0.15;
    ref.current.rotation.y = Math.sin(t * rotSpeed + offset) * 0.3;
  });

  return (
    <Billboard ref={ref} position={position}>
      <Text fontSize={0.55 * scale} anchorX="center" anchorY="middle">
        {emoji}
      </Text>
    </Billboard>
  );
}

/* ── glowing skill orb ── */
function SkillOrb({ position, color, label, speed = 0.8 }) {
  const meshRef = useRef();
  const glowRef = useRef();
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(t * speed + offset) * 0.35;
      meshRef.current.rotation.z = t * 0.4;
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.18 + Math.sin(t * 1.5 + offset) * 0.07;
    }
  });

  return (
    <group position={position}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.28, 20, 20]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.16, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} roughness={0.1} metalness={0.6} />
      </mesh>
      <Billboard position={[0, 0.35, 0]}>
        <Text fontSize={0.13} color={color} anchorX="center" fontWeight="bold">
          {label}
        </Text>
      </Billboard>
    </group>
  );
}

/* ── spinning star decoration ── */
function StarDeco({ position, color, size = 0.12 }) {
  const ref = useRef();
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * 1.2 + offset;
      ref.current.rotation.x = state.clock.elapsedTime * 0.6 + offset;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.8 + offset) * 0.2;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[size, 0]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
    </mesh>
  );
}

/* ── animated connection line between two positions ── */
function ConnectionLine({ from, to, color }) {
  const ref = useRef();
  const points = useMemo(() => [new THREE.Vector3(...from), new THREE.Vector3(...to)], []);
  useFrame((state) => {
    if (ref.current) ref.current.material.opacity = 0.2 + Math.sin(state.clock.elapsedTime * 1.2) * 0.1;
  });
  return (
    <line ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array([...from, ...to])}
          count={2}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.25} />
    </line>
  );
}

/* ── particle field ── */
function Particles() {
  const count = 120;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  }, []);
  const ref = useRef();
  useFrame((s) => { if (ref.current) ref.current.rotation.y = s.clock.elapsedTime * 0.025; });
  const colors = useMemo(() => {
    const c = new Float32Array(count * 3);
    const palette = [[1, 0.42, 0.17], [1, 0.31, 0.64], [0.23, 0.48, 1], [0, 0.9, 0.63], [1, 0.84, 0]];
    for (let i = 0; i < count; i++) {
      const p = palette[i % palette.length];
      c[i * 3] = p[0]; c[i * 3 + 1] = p[1]; c[i * 3 + 2] = p[2];
    }
    return c;
  }, []);
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colors} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

/* ── MAIN SCENE ── */
function Scene({ mode = 'landing' }) {
  const CHARACTERS = [
    { emoji: '🤖', pos: [-3.2,  1.2, 0],  speed: 0.7,  scale: 1.5, label: 'Doraemon' },
    { emoji: '😤', pos: [ 3.0,  0.8, 0],  speed: 0.9,  scale: 1.4, label: 'Shin Chan' },
    { emoji: '🥷', pos: [-2.2, -1.4, 0.5],speed: 1.1,  scale: 1.3, label: 'Ninja Hattori' },
    { emoji: '🧒', pos: [ 2.5, -1.2, 0.5],speed: 0.8,  scale: 1.3, label: 'Dora Bujji' },
    { emoji: '🥋', pos: [ 0.2,  2.2, 0],  speed: 0.6,  scale: 1.4, label: 'Jackie Chan' },
    { emoji: '🐱', pos: [-3.5, -0.3, 1],  speed: 1.0,  scale: 1.1, label: 'Hello Kitty' },
    { emoji: '🦸', pos: [ 3.5,  1.8, 1],  speed: 0.75, scale: 1.2, label: 'Hero' },
    { emoji: '🌟', pos: [ 0,   -2.2, 0.5],speed: 1.3,  scale: 1.0, label: '' },
  ];

  const SKILLS = [
    { pos: [-1.2, 1.0, 1.5],  color: '#FF6B2B', label: '💻 Coding' },
    { pos: [ 1.5, 0.5, 1.5],  color: '#FF4FA3', label: '🎸 Music' },
    { pos: [-0.8,-1.5, 1.0],  color: '#3A7BFF', label: '🌍 Lang' },
    { pos: [ 0.8, 1.8, 1.0],  color: '#00E5A0', label: '🧘 Yoga' },
    { pos: [ 2.0,-0.8, 1.5],  color: '#FFD700', label: '🎨 Art' },
    { pos: [-2.0, 0.5, 1.0],  color: '#9B59FF', label: '📸 Photo' },
  ];

  const STARS = [
    { pos: [1.2, -1.8, 0.8], color: '#FFD700', size: 0.10 },
    { pos: [-1.5, 2.0, 0.5], color: '#FF4FA3', size: 0.08 },
    { pos: [3.0, -0.5, 0.8], color: '#00BFFF', size: 0.09 },
    { pos: [-3.0, 1.5, 0.6], color: '#00E5A0', size: 0.08 },
    { pos: [0.5, 2.8, 0.4],  color: '#FF6B2B', size: 0.11 },
  ];

  const LINES = [
    { from: [-3.2, 1.2, 0], to: [-1.2, 1.0, 1.5], color: '#FF6B2B' },
    { from: [3.0, 0.8, 0],  to: [1.5, 0.5, 1.5],  color: '#FF4FA3' },
    { from: [0.2, 2.2, 0],  to: [0.8, 1.8, 1.0],  color: '#3A7BFF' },
    { from: [2.5,-1.2, 0.5],to: [2.0,-0.8, 1.5],  color: '#00E5A0' },
  ];

  return (
    <>
      <ambientLight intensity={1.2} color="#FFF8F0" />
      <pointLight position={[4, 4, 4]}  color="#FF6B2B" intensity={3} />
      <pointLight position={[-4, 2, 3]} color="#3A7BFF" intensity={2} />
      <pointLight position={[0, -3, 4]} color="#FF4FA3" intensity={2.5} />

      <Particles />

      {CHARACTERS.map((c, i) => (
        <EmojiSprite key={i} emoji={c.emoji} position={c.pos} speed={c.speed} scale={c.scale} />
      ))}

      {SKILLS.map((s, i) => (
        <SkillOrb key={i} position={s.pos} color={s.color} label={s.label} />
      ))}

      {STARS.map((s, i) => (
        <StarDeco key={i} position={s.pos} color={s.color} size={s.size} />
      ))}

      {LINES.map((l, i) => (
        <ConnectionLine key={i} from={l.from} to={l.to} color={l.color} />
      ))}
    </>
  );
}

export default function FloatingCharacters({ height = '100%', mode = 'landing' }) {
  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 7], fov: 58 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <Scene mode={mode} />
        </Suspense>
      </Canvas>
    </div>
  );
}
