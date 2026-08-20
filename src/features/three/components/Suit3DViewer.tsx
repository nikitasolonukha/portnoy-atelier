"use client";

import React, { useState, useEffect, Suspense, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import type { Fabric } from "@/types/domain";
import { deriveSuitVisualState } from "../state/derive-suit-visual-state";
import { useFabricMaterial } from "../materials/useFabricMaterial";
import { SuitModel } from "./SuitModel";
import { SuitLighting } from "./SuitLighting";
import { SuitCameraControls } from "./SuitCameraControls";
import { ViewerOverlay } from "./ViewerOverlay";
import { ViewerFallback } from "./ViewerFallback";
import type { CameraPresetKey } from "../model/suit-model-types";
import { CAMERA_PRESETS, SUIT_STAGE } from "../utils/camera-presets";

function detectWebglError(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    return gl ? null : "WebGL не поддерживается текущим браузером или видеокартой.";
  } catch {
    return "Ошибка инициализации WebGL контекста.";
  }
}

export interface Suit3DViewerProps {
  fabric?: Fabric | null;
  settings?: Record<string, string> | null;
  className?: string;
}

function SceneContents({
  fabric,
  settings,
  presetKey,
  autoRotate,
  onUserInteraction,
}: {
  fabric?: Fabric | null;
  settings?: Record<string, string> | null;
  presetKey: CameraPresetKey;
  autoRotate: boolean;
  onUserInteraction: () => void;
}) {
  const visualState = useMemo(() => deriveSuitVisualState(settings), [settings]);
  const materials = useFabricMaterial(fabric);

  return (
    <>
      <color attach="background" args={["#1c222b"]} />
      <SuitLighting />
      <SuitModel visualState={visualState} materials={materials} />
      <SuitCameraControls
        presetKey={presetKey}
        autoRotate={autoRotate}
        onUserInteraction={onUserInteraction}
      />
    </>
  );
}

export function Suit3DViewer({ fabric, settings, className = "" }: Suit3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePreset, setActivePreset] = useState<CameraPresetKey>("three-quarters");
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [webglError, setWebglError] = useState<string | null>(() => detectWebglError());

  const visualState = useMemo(() => deriveSuitVisualState(settings), [settings]);

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {
          setIsFullscreen(false);
        });
      } else {
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (webglError) {
    return (
      <ViewerFallback
        fabric={fabric}
        error={webglError}
        onRetry={() => setWebglError(detectWebglError())}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`suit-viewer relative w-full overflow-hidden bg-[var(--graphite)] select-none ${
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none w-screen h-screen"
          : "h-full min-h-[480px] rounded-[inherit] border border-[var(--steel-soft)]"
      } ${className}`}
      aria-label="Интерактивный 3D просмотрщик костюма"
      data-jacket={visualState.jacket}
      data-lapel={visualState.lapel}
      data-buttons={visualState.buttons}
      data-pockets={visualState.pockets}
      data-trousers={visualState.trousers}
      data-vest={visualState.vest}
    >
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: CAMERA_PRESETS["three-quarters"].position, fov: CAMERA_PRESETS["three-quarters"].fov }}
        onCreated={({ camera }) => {
          camera.lookAt(0, SUIT_STAGE.centerY, 0);
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      >
        <Suspense fallback={null}>
          <SceneContents
            fabric={fabric}
            settings={settings}
            presetKey={activePreset}
            autoRotate={autoRotate}
            onUserInteraction={() => setAutoRotate(false)}
          />
        </Suspense>
      </Canvas>

      <ViewerOverlay
        fabric={fabric}
        visualState={visualState}
        activePreset={activePreset}
        onSelectPreset={(key) => {
          setAutoRotate(false);
          setActivePreset(key);
        }}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onResetCamera={() => {
          setAutoRotate(false);
          setActivePreset("three-quarters");
        }}
      />
    </div>
  );
}
