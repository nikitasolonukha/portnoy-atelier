import React, { useRef, useEffect, type ComponentRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { CameraPresetKey } from "../model/suit-model-types";
import { CAMERA_PRESETS, SUIT_STAGE } from "../utils/camera-presets";

interface SuitCameraControlsProps {
  presetKey?: CameraPresetKey;
  autoRotate?: boolean;
  onUserInteraction?: () => void;
}

type OrbitControlsRef = ComponentRef<typeof OrbitControls>;

export function SuitCameraControls({
  presetKey = "three-quarters",
  autoRotate = false,
  onUserInteraction,
}: SuitCameraControlsProps) {
  const controlsRef = useRef<OrbitControlsRef>(null);
  const { camera } = useThree();

  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3(...CAMERA_PRESETS[presetKey].position));
  const targetLook = useRef<THREE.Vector3>(new THREE.Vector3(...CAMERA_PRESETS[presetKey].target));
  const isTransitioning = useRef<boolean>(false);

  useEffect(() => {
    const preset = CAMERA_PRESETS[presetKey] || CAMERA_PRESETS["three-quarters"];
    targetPos.current.set(...preset.position);
    targetLook.current.set(...preset.target);
    isTransitioning.current = true;
  }, [presetKey]);

  useFrame((_, delta) => {
    if (isTransitioning.current && controlsRef.current) {
      const step = Math.min(1, delta * 6.5);
      camera.position.lerp(targetPos.current, step);
      controlsRef.current.target.lerp(targetLook.current, step);
      controlsRef.current.update();

      if (camera.position.distanceTo(targetPos.current) < 0.01) {
        isTransitioning.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      rotateSpeed={0.7}
      zoomSpeed={0.8}
      makeDefault
      target={[0, SUIT_STAGE.centerY, 0]}
      enablePan={false}
      minDistance={1.45}
      maxDistance={5.2}
      minPolarAngle={Math.PI / 5}
      maxPolarAngle={Math.PI / 1.9}
      autoRotate={autoRotate}
      autoRotateSpeed={1.0}
      onStart={() => {
        isTransitioning.current = false;
        if (onUserInteraction) onUserInteraction();
      }}
    />
  );
}
