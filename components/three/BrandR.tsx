"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";

interface BrandRProps {
  scale?: number;
  interactive?: boolean;
  onReady?: () => void;
}

export const BrandR: React.FC<BrandRProps> = ({
  scale = 1.0,
  interactive = true,
  onReady,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const startTimeRef = useRef<number | null>(null);

  // Load optimized normalized Letter R model
  const { scene } = useGLTF("/models/letter_r_optimized.glb");

  // Premium machine materials palette
  const materials = useMemo(() => {
    // Dark graphite metallic body (#111318)
    const body = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#111318"),
      metalness: 0.88,
      roughness: 0.24,
      envMapIntensity: 1.2,
    });

    return { body };
  }, []);

  const { clonedScene, edgeLines, normScale } = useMemo(() => {
    const clone = scene.clone(true);

    // 1. Calculate actual bounding box from ALL visible child meshes
    const box = new THREE.Box3();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = materials.body;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (mesh.geometry) {
          mesh.geometry.computeBoundingBox();
        }
        box.expandByObject(mesh);
      }
    });

    const center = new THREE.Vector3();
    box.getCenter(center);
    const size = new THREE.Vector3();
    box.getSize(size);

    // 2. Center the model based on its actual bounding-box center
    // Visual center is positioned precisely at (0, 0, 0)
    clone.position.set(-center.x, -center.y, -center.z);

    // 3. Auto-normalize height to 2.0 units if imported with raw dimensions
    const norm = size.y > 0 ? 2.0 / size.y : 1.0;

    // 4. Extract architectural silver edges for luxury hardware look
    const edgesGroup = new THREE.Group();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        try {
          const edges = new THREE.EdgesGeometry(mesh.geometry, 30);
          const line = new THREE.LineSegments(
            edges,
            new THREE.LineBasicMaterial({
              color: new THREE.Color("#8A909A"),
              transparent: true,
              opacity: 0.35,
              blending: THREE.AdditiveBlending,
            })
          );
          edgesGroup.add(line);
        } catch {
          // ignore if non-indexed
        }
      }
    });
    edgesGroup.position.copy(clone.position);

    const dims = {
      height: size.y * norm,
      width: size.x * norm,
      depth: size.z * norm,
    };

    return {
      clonedScene: clone,
      edgeLines: edgesGroup,
      normScale: norm,
    };
  }, [scene, materials]);

  useEffect(() => {
    if (onReady) {
      onReady();
    }
  }, [onReady]);

  // Initial slight editorial tilt
  const baseRotY = 0.2;
  const baseRotX = 0.06;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    if (startTimeRef.current === null) {
      startTimeRef.current = time;
    }

    // 1. Intro animation: 800ms smooth cubic bloom (scale 0.94 -> 1.0, pos -0.06 -> 0.0)
    const elapsed = time - startTimeRef.current;
    const introProgress = Math.min(1, elapsed / 0.8);
    const ease = 1 - Math.pow(1 - introProgress, 3);
    const introScale = 0.94 + 0.06 * ease;
    const introPosY = -0.06 * (1 - ease);

    // 2. Subtle idle floating & slow breathing rotation
    const idleRotY = Math.sin(time * 0.25) * 0.07;
    const idleRotX = Math.cos(time * 0.2) * 0.03;

    // 3. Gentle mouse parallax offset (clamped to guarantee 0% border collision)
    const targetMouseX = interactive
      ? THREE.MathUtils.clamp(state.pointer.x * 0.16, -0.16, 0.16)
      : 0;
    const targetMouseY = interactive
      ? THREE.MathUtils.clamp(-state.pointer.y * 0.10, -0.10, 0.10)
      : 0;

    // 4. Smooth spring damping lerp
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      baseRotY + idleRotY + targetMouseX,
      2.5,
      delta
    );

    groupRef.current.rotation.x = THREE.MathUtils.damp(
      groupRef.current.rotation.x,
      baseRotX + idleRotX + targetMouseY,
      2.5,
      delta
    );

    // 5. Very subtle vertical floating motion (safe amplitude 0.035 units)
    const floatY = Math.sin(time * 0.6) * 0.035;
    groupRef.current.position.y = introPosY + floatY;

    // 6. Very subtle breathing scale (amplitude 0.5%)
    const breathing = 1 + Math.sin(time * 0.5) * 0.005;
    const finalScale = scale * normScale * introScale * breathing;
    groupRef.current.scale.set(finalScale, finalScale, finalScale);
  });

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={clonedScene} />
      <primitive object={edgeLines} />
    </group>
  );
};
