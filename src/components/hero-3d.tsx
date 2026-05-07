"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function ParticleField() {
  const meshRef = useRef<THREE.Points>(null);
  const count = 800;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Spread particles in a sphere
      const r = 3 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Cyan to purple gradient
      const t = Math.random();
      col[i * 3] = 0.02 + t * 0.5;     // R
      col[i * 3 + 1] = 0.7 - t * 0.4;  // G
      col[i * 3 + 2] = 0.83 + t * 0.1;  // B
    }

    return [pos, col];
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.y = time * 0.05;
    meshRef.current.rotation.x = Math.sin(time * 0.03) * 0.1;

    // Subtle mouse reactivity
    const mx = state.pointer.x * 0.3;
    const my = state.pointer.y * 0.3;
    meshRef.current.rotation.z = mx * 0.1;
    meshRef.current.position.x = mx * 0.5;
    meshRef.current.position.y = my * 0.5;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        vertexColors
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function GlowOrb() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.scale.setScalar(1 + Math.sin(time * 0.5) * 0.15);
    meshRef.current.position.y = Math.sin(time * 0.3) * 0.5;
    meshRef.current.rotation.y = time * 0.2;

    // Mouse reactivity
    meshRef.current.position.x = state.pointer.x * 0.8;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.2, 64, 64]} />
      <meshBasicMaterial
        color="#06b6d4"
        transparent
        opacity={0.08}
        wireframe
      />
    </mesh>
  );
}

function InnerOrb() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    meshRef.current.scale.setScalar(0.6 + Math.sin(time * 0.8) * 0.1);
    meshRef.current.rotation.x = time * 0.3;
    meshRef.current.rotation.z = time * 0.15;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[0.7, 2]} />
      <meshBasicMaterial
        color="#8b5cf6"
        transparent
        opacity={0.12}
        wireframe
      />
    </mesh>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.2} />
        <ParticleField />
        <GlowOrb />
        <InnerOrb />
      </Canvas>
      {/* Radial gradient overlay for blending */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background pointer-events-none" />
    </div>
  );
}
