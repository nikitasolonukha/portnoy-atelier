"use client";

import { Suspense } from "react";
import type { SuitVisualState } from "../model/suit-model-types";
import type { SuitMaterialsMap } from "../materials/useFabricMaterial";
import { GLBSuit } from "./GLBSuit";

type SuitModelProps = {
  visualState: SuitVisualState;
  materials: SuitMaterialsMap;
};

/**
 * 3D shows the proven Sketchfab suit (fabric + silhouette only).
 * Construction swaps (double/single, lapel, buttons, pockets, vest) are
 * intentionally NOT faked with broken donor meshes or overlays — use 2D.
 * Modular donors remain in the Blender pipeline for a future phase-2 GLB.
 */
export function SuitModel({ visualState, materials }: SuitModelProps) {
  return (
    <Suspense fallback={null}>
      <GLBSuit visualState={visualState} materials={materials} />
    </Suspense>
  );
}
