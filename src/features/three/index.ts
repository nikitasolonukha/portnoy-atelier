export { Suit3DViewer } from "./components/Suit3DViewer";
export { ProceduralSuit } from "./components/ProceduralSuit";
export { SuitLighting } from "./components/SuitLighting";
export { SuitCameraControls } from "./components/SuitCameraControls";
export { ViewerOverlay } from "./components/ViewerOverlay";
export { ViewerFallback } from "./components/ViewerFallback";
export { deriveSuitVisualState, DEFAULT_SUIT_VISUAL_STATE } from "./state/derive-suit-visual-state";
export { resolveSuitVisibleNodes, MODULAR_SUIT_GLB } from "./state/resolve-suit-nodes";
export { SUIT_MODEL_MANIFEST } from "./model/suit-model-manifest";
export { CAMERA_PRESETS, SUIT_STAGE } from "./utils/camera-presets";
export { useFabricMaterial } from "./materials/useFabricMaterial";
export { getFabricTextureProfile } from "./materials/fabricTextureProfile";
export { createProceduralFabricTexture } from "./materials/proceduralFabricTexture";
export type {
  SuitVisualState,
  SuitModelManifest,
  CameraPresetKey,
  CameraPreset,
} from "./model/suit-model-types";
