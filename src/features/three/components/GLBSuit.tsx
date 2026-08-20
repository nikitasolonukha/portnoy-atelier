"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { SuitVisualState } from "../model/suit-model-types";
import type { SuitMaterialsMap } from "../materials/useFabricMaterial";
import { extendGltfLoader } from "../utils/gltf-loader";
import { SUIT_STAGE } from "../utils/camera-presets";

const TARGET_HEIGHT = SUIT_STAGE.height;

interface GLBSuitProps {
  /** Kept for SuitModel API; construction variants need a modular GLB, not overlays. */
  visualState: SuitVisualState;
  materials: SuitMaterialsMap;
}

function isButtonMaterial(material: THREE.Material | THREE.Material[]): boolean {
  const materials = Array.isArray(material) ? material : [material];
  return materials.some((entry) => /button/i.test(entry.name));
}

export function GLBSuit({ materials }: GLBSuitProps) {
  const { scene } = useGLTF("/models/suit-web-v2.glb", false, true, extendGltfLoader);
  const { fabricMaterial, buttonMaterial } = materials;

  const { dressedScene, fit } = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = size.y > 0.0001 ? TARGET_HEIGHT / size.y : 1;
    const xOffset = -center.x * scale;
    const yOffset = -box.min.y * scale;
    const zOffset = -center.z * scale;

    clone.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;

      const useButton = isButtonMaterial(node.material);
      // Clone so disposing hook materials cannot blank an already-mounted scene.
      const mat = (useButton ? buttonMaterial : fabricMaterial).clone();
      if (!useButton) {
        mat.side = THREE.DoubleSide;
        mat.color = new THREE.Color(0xffffff);
      }
      node.material = mat;
      node.castShadow = true;
      node.receiveShadow = true;
    });

    return { dressedScene: clone, fit: { scale, xOffset, yOffset, zOffset } };
  }, [scene, fabricMaterial, buttonMaterial]);

  return (
    <group scale={fit.scale} position={[fit.xOffset, fit.yOffset, fit.zOffset]}>
      <primitive object={dressedScene} />
    </group>
  );
}

useGLTF.preload("/models/suit-web-v2.glb", false, true, extendGltfLoader);
