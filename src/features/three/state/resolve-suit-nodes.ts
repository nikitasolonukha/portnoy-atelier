/**
 * Maps configurator business state → semantic GLB node names.
 * Phase 1 ships whole jacket variants (not fake lapel overlays).
 */
import type { SuitVisualState } from "../model/suit-model-types";

/** Cache-bust so rebuilds are not stuck behind browser / useGLTF cache. */
export const MODULAR_SUIT_GLB = "/models/suit-configurable-v3.glb?v=20260820f";

export type ModularSuitPhase = 1 | 2;

/** Nodes expected in phase-1 export from Blender donor pipeline. */
export const PHASE1_NODES = [
  "JACKET_SINGLE_NOTCH",
  "JACKET_DOUBLE_PEAK",
  "VEST_SINGLE",
  "TROUSERS_CLASSIC",
] as const;

export type Phase1Node = (typeof PHASE1_NODES)[number];

/**
 * Resolve which semantic meshes should be visible.
 * Phase 1 honestly collapses unsupported lapel/pocket/pleat options
 * onto the four real variants instead of drawing overlays.
 */
export function resolveSuitVisibleNodes(
  state: SuitVisualState,
  phase: ModularSuitPhase = 1,
): string[] {
  const visible: string[] = [];

  if (state.jacket === "double") {
    visible.push("JACKET_DOUBLE_PEAK");
  } else {
    visible.push("JACKET_SINGLE_NOTCH");
  }

  if (state.vest !== "none") {
    // Phase 1 only ships VEST_SINGLE; double vest is a later donor edit.
    visible.push(phase > 1 && state.vest === "double" ? "VEST_DOUBLE" : "VEST_SINGLE");
  }

  if (phase === 1) {
    visible.push("TROUSERS_CLASSIC");
  } else if (state.trousers === "pleated") {
    visible.push("TROUSERS_PLEATED");
  } else if (state.trousers === "double-pleat") {
    visible.push("TROUSERS_DOUBLE_PLEAT");
  } else {
    visible.push("TROUSERS_CLASSIC");
  }

  return visible;
}

export function describeActiveConstruction(state: SuitVisualState): string {
  const jacket = state.jacket === "double" ? "double (2D)" : "single";
  const vest = state.vest === "none" ? "no vest" : `vest ${state.vest} (2D)`;
  return `${jacket}/${state.lapel} · ${vest}`;
}
