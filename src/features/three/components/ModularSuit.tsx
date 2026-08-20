"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import type { SuitVisualState } from "../model/suit-model-types";
import type { SuitMaterialsMap } from "../materials/useFabricMaterial";
import { extendGltfLoader } from "../utils/gltf-loader";
import { SUIT_STAGE } from "../utils/camera-presets";
import { MODULAR_SUIT_GLB, resolveSuitVisibleNodes } from "../state/resolve-suit-nodes";

const TARGET_HEIGHT = SUIT_STAGE.height;

type ModularSuitProps = {
  visualState: SuitVisualState;
  materials: SuitMaterialsMap;
};

function isButtonNode(name: string): boolean {
  return /button/i.test(name);
}

export function ModularSuit({ visualState, materials }: ModularSuitProps) {
  const { scene } = useGLTF(MODULAR_SUIT_GLB, false, true, extendGltfLoader);
  const { fabricMaterial, buttonMaterial } = materials;
  const visibleNames = useMemo(() => resolveSuitVisibleNodes(visualState, 1), [visualState]);
  const visible = useMemo(() => new Set(visibleNames), [visibleNames]);

  const { dressedScene, fit } = useMemo(() => {
    const clone = scene.clone(true);
    clone.updateMatrixWorld(true);

    clone.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      node.visible = visible.has(node.name);
      if (isButtonNode(node.name) || /button/i.test(node.parent?.name ?? "")) {
        node.material = buttonMaterial;
      } else {
        fabricMaterial.side = THREE.DoubleSide;
        node.material = fabricMaterial;
      }
      node.castShadow = true;
      node.receiveShadow = true;
    });

    // Fit to the active construction only (hidden donors must not inflate bbox).
    clone.updateMatrixWorld(true);
    const box = new THREE.Box3();
    clone.traverse((node) => {
      if (node instanceof THREE.Mesh && node.visible) {
        box.expandByObject(node);
      }
    });
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = size.y > 0.0001 ? TARGET_HEIGHT / size.y : 1;

    return {
      dressedScene: clone,
      fit: {
        scale,
        xOffset: -center.x * scale,
        yOffset: -box.min.y * scale,
        zOffset: -center.z * scale,
      },
    };
  }, [scene, fabricMaterial, buttonMaterial, visible]);

  return (
    <group scale={fit.scale} position={[fit.xOffset, fit.yOffset, fit.zOffset]}>
      <primitive object={dressedScene} />
    </group>
  );
}

useGLTF.preload(MODULAR_SUIT_GLB, false, true, extendGltfLoader);
