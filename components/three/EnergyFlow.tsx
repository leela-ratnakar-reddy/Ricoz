"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

interface EnergyFlowProps {
  reduced?: boolean;
}

export const EnergyFlow: React.FC<EnergyFlowProps> = ({ reduced = false }) => {
  const groupRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Points>(null);
  const ring1Ref = useRef<THREE.LineLoop>(null);
  const ring2Ref = useRef<THREE.LineLoop>(null);

  // Curated particle positions and colors
  const particleCount = reduced ? 18 : 48;

  const [positions, colors, scales] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const col = new Float32Array(particleCount * 3);
    const sca = new Float32Array(particleCount);

    const palette = [
      new THREE.Color("#8A909A"), // Muted silver/gray (majority)
      new THREE.Color("#8A909A"),
      new THREE.Color("#454A53"), // Dark steel
      new THREE.Color("#C8FF3D"), // Signature lime (occasional)
      new THREE.Color("#8B5CF6"), // Accent violet (occasional)
      new THREE.Color("#F5F5F0"), // Off-white point
    ];

    for (let i = 0; i < particleCount; i++) {
      // Cylindrical/spherical distribution around the R
      const radius = 1.2 + Math.random() * 1.6;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 2.8;

      pos[i * 3 + 0] = Math.cos(theta) * radius;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = Math.sin(theta) * radius;

      const chosenColor = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3 + 0] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;

      sca[i] = 1.0 + Math.random() * 2.0;
    }

    return [pos, col, sca];
  }, [particleCount]);

  // Subtle curved orbital ring geometries
  const ringGeometry1 = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 64;
    const xRadius = 2.0;
    const zRadius = 1.3;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.cos(theta) * xRadius,
          Math.sin(theta * 2) * 0.15,
          Math.sin(theta) * zRadius
        )
      );
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  const ringGeometry2 = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 64;
    const xRadius = 1.6;
    const zRadius = 2.1;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(
        new THREE.Vector3(
          Math.cos(theta) * xRadius,
          -Math.sin(theta * 2) * 0.18,
          Math.sin(theta) * zRadius
        )
      );
    }
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.08;
      particlesRef.current.rotation.x = Math.sin(time * 0.2) * 0.05;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.y += delta * 0.12;
      ring1Ref.current.rotation.x = 0.45 + Math.sin(time * 0.3) * 0.05;
      ring1Ref.current.rotation.z = -0.2;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.09;
      ring2Ref.current.rotation.x = -0.35 + Math.cos(time * 0.25) * 0.05;
      ring2Ref.current.rotation.z = 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Slow orbiting particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.035}
          vertexColors
          transparent
          opacity={0.75}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Orbital energy ring 1: Subtle Lime Trail */}
      <primitive
        object={new THREE.LineLoop(
          ringGeometry1,
          new THREE.LineBasicMaterial({
            color: 0xc8ff3d,
            transparent: true,
            opacity: 0.22,
            blending: THREE.AdditiveBlending,
          })
        )}
        ref={ring1Ref}
      />

      {/* Orbital energy ring 2: Subtle Violet Trail */}
      <primitive
        object={new THREE.LineLoop(
          ringGeometry2,
          new THREE.LineBasicMaterial({
            color: 0x8b5cf6,
            transparent: true,
            opacity: 0.18,
            blending: THREE.AdditiveBlending,
          })
        )}
        ref={ring2Ref}
      />
    </group>
  );
};
