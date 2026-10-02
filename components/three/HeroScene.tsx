"use client";

import React, { useState, useEffect, useCallback, Component, ErrorInfo, ReactNode } from "react";
import { Scene } from "./Scene";
import { FallbackR } from "./FallbackR";

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
  onError?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ThreeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("3D Engine fallback triggered:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function HeroScene() {
  const [canRender3D, setCanRender3D] = useState(false);
  const [is3DReady, setIs3DReady] = useState(false);

  useEffect(() => {
    // 1. Detect WebGL support gracefully without blocking UI
    const checkWebGL = (): boolean => {
      try {
        const canvas = document.createElement("canvas");
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext("webgl2") ||
            canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl"))
        );
      } catch {
        return false;
      }
    };

    if (checkWebGL()) {
      setCanRender3D(true);
    }
  }, []);

  const handleLoaded = useCallback(() => {
    // 3D Model ready: trigger seamless 800ms crossfade
    setIs3DReady(true);
  }, []);

  const handleError = useCallback(() => {
    // Fail gracefully to permanent lightweight Fallback R
    setCanRender3D(false);
    setIs3DReady(false);
  }, []);

  return (
    <div className="w-full h-full min-h-[380px] lg:min-h-[520px] relative select-none">
      {/* 1. INSTANTANEOUS FALLBACK R:
          Visible from the very first millisecond so the user never waits.
          Transitions out with opacity 1 -> 0 over 800ms once 3D is verified ready. */}
      <div
        className={`absolute inset-0 transition-opacity duration-800 ease-out z-10 ${
          is3DReady ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <FallbackR isFadingOut={is3DReady} />
      </div>

      {/* 2. REAL 3D SCENE:
          Loads asynchronously in background without blocking initial paint.
          Transitions in with opacity 0 -> 1 over 800ms once ready. */}
      {canRender3D && (
        <div
          className={`w-full h-full min-h-[380px] lg:min-h-[520px] transition-opacity duration-800 ease-out ${
            is3DReady ? "opacity-100 relative z-20" : "opacity-0 pointer-events-none"
          }`}
        >
          <ThreeErrorBoundary fallback={<FallbackR />} onError={handleError}>
            <Scene
              scale={1.0}
              className="w-full h-full min-h-[380px] lg:min-h-[520px]"
              onLoaded={handleLoaded}
              onError={handleError}
            />
          </ThreeErrorBoundary>
        </div>
      )}
    </div>
  );
}
