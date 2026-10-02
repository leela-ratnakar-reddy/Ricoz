"use client";

import React, { Suspense, useState, useEffect, useLayoutEffect } from "react";
import * as THREE from "three";
import { Canvas, useThree } from "@react-three/fiber";
import { BrandR } from "./BrandR";
import { Lighting } from "./Lighting";
import { EnergyFlow } from "./EnergyFlow";

interface SceneProps {
  scale?: number;
  className?: string;
  showBackdropEffects?: boolean;
  onLoaded?: () => void;
  onError?: (err: Error) => void;
}

interface ModelDimensions {
  height: number;
  width: number;
  depth: number;
}

// Dynamically calculates camera distance based on model dimensions, aspect ratio, FOV, and 25% safety margins
function ResponsiveCameraController({
  dimensions,
}: {
  dimensions: ModelDimensions;
}) {
  const { camera, size } = useThree();

  useLayoutEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const persCamera = camera as THREE.PerspectiveCamera;
    const fov = persCamera.fov || 40;
    const fovRad = (fov / 2) * (Math.PI / 180);
    const tanHalfFov = Math.tan(fovRad); // ~0.36397 for 40 deg

    // 1. Target vertical occupancy: ~68% at rest (leaving 15-16% top & bottom margin)
    const targetOccupancy = 0.68;

    // 2. Base distance required to fit model height in target occupancy:
    // visibleHeight = 2 * D * tanHalfFov => D = height / (targetOccupancy * 2 * tanHalfFov)
    const rawDistVert = dimensions.height / (targetOccupancy * 2 * tanHalfFov);

    // 3. Safety multiplier (1.35) to account for 3D rotation, tilt, and vertical floating:
    const safeDistVert = rawDistVert * 1.35;

    // 4. Horizontal margin calculation:
    // On square or portrait containers (aspect < 1.1), horizontal width requires enough distance
    // so left & right margins remain comfortably >= 12%:
    const rawDistHoriz = dimensions.width / (targetOccupancy * 2 * tanHalfFov * aspect);
    const safeDistHoriz = rawDistHoriz * 1.35;

    // Use the max of vertical and horizontal required distances:
    const targetDistance = Math.max(safeDistVert, safeDistHoriz);

    // Apply distance to camera along Z, looking directly at center (0, 0, 0):
    camera.position.set(0, 0, targetDistance);
    camera.lookAt(0, 0, 0);
    camera.near = 0.01;
    camera.far = 100;
    camera.updateProjectionMatrix();
  }, [camera, size.width, size.height, dimensions]);

  return null;
}

const MODEL_DIMENSIONS: ModelDimensions = {
  height: 2.0,
  width: 2.15,
  depth: 1.97,
};

export const Scene: React.FC<SceneProps> = ({
  scale = 1.0,
  className = "w-full h-full min-h-[380px] lg:min-h-[520px]",
  showBackdropEffects = true,
  onLoaded,
}) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsTouchDevice(
      "ontouchstart" in window || navigator.maxTouchPoints > 0
    );
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <div className={`relative ${className} select-none flex items-center justify-center rounded-2xl border border-surface-border bg-surface/30 overflow-hidden`}>
      {/* Soft atmospheric depth behind R */}
      {showBackdropEffects && (
        <>
          {/* Subtle violet/lime radial ambient glow */}
          <div className="absolute inset-0 pointer-events-none bg-hero-glow opacity-80" />
          <div className="absolute w-80 h-80 rounded-full bg-violet/10 blur-3xl pointer-events-none -top-10 -left-10" />
          <div className="absolute w-72 h-72 rounded-full bg-accent/10 blur-3xl pointer-events-none -bottom-10 -right-10" />
          
          {/* Architectural framing guidelines */}
          <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-surface-border/50 pointer-events-none opacity-40" />
          <div className="absolute w-80 h-80 sm:w-96 sm:h-96 rounded-full border border-dashed border-surface-border/30 pointer-events-none opacity-30" />
          
          {/* Technical Metadata corner annotations */}
          <div className="absolute top-5 left-6 font-mono text-[10px] text-brand-muted tracking-widest uppercase flex items-center gap-2 pointer-events-none z-20">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>RICOZ // 01 / R</span>
          </div>
          <div className="absolute top-5 right-6 font-mono text-[10px] text-brand-secondary tracking-widest uppercase hidden sm:block pointer-events-none z-20">
            CREATIVE IDENTITY
          </div>
          <div className="absolute bottom-5 left-6 font-mono text-[9px] text-brand-muted/70 tracking-widest uppercase hidden sm:block pointer-events-none z-20">
            ENGINE // 3D HARDWARE ACCELERATED
          </div>
          <div className="absolute bottom-5 right-6 font-mono text-[9px] text-accent/80 tracking-widest uppercase flex items-center gap-1.5 pointer-events-none z-20">
            <span className="w-1 h-1 rounded-full bg-accent" />
            <span>CINEMATIC STUDIO</span>
          </div>
        </>
      )}

      <Canvas
        dpr={isMobile ? [1, 1] : [1, 1.5]}
        camera={{ position: [0, 0, 5.7], fov: 40, near: 0.01, far: 100 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        className="relative z-10 w-full h-full"
      >
        <ResponsiveCameraController dimensions={MODEL_DIMENSIONS} />
        <Lighting />
        <EnergyFlow reduced={isMobile} />
        <Suspense fallback={null}>
          <BrandR
            scale={scale}
            interactive={!isTouchDevice}
            onReady={onLoaded}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};
