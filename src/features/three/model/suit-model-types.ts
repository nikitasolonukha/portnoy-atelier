export type SuitVisualState = {
  jacket: "single" | "double";
  lapel: "notch" | "peak" | "shawl";
  buttons: "one" | "two" | "three-roll-two";
  pockets: "flap" | "jetted" | "patch";
  trousers: "classic" | "pleated" | "double-pleat";
  vest: "none" | "single" | "double";
};

export type CameraPresetKey = "front" | "three-quarters" | "side" | "back" | "close-lapel" | "reset";

export type CameraPreset = {
  key: CameraPresetKey;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
};

export type SuitModelManifest = {
  version: string;
  materialTargets: {
    mainFabric: string[];
    buttons: string[];
    lining: string[];
    details: string[];
  };
  nodes: {
    jacket: Record<SuitVisualState["jacket"], string[]>;
    lapel: Record<SuitVisualState["lapel"], string[]>;
    buttons: Record<SuitVisualState["buttons"], string[]>;
    pockets: Record<SuitVisualState["pockets"], string[]>;
    trousers: Record<SuitVisualState["trousers"], string[]>;
    vest: Record<SuitVisualState["vest"], string[]>;
  };
};

export type PerformanceTier = "low" | "medium" | "high";

export type RendererDiagnostics = {
  fps: number;
  triangles: number;
  drawCalls: number;
  textures: number;
  geometries: number;
  dpr: number;
};
