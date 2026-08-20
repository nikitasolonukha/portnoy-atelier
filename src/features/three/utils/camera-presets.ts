import type { CameraPreset, CameraPresetKey } from "../model/suit-model-types";

/** Standing figure: feet at y=0, head at `height`. Camera looks at `centerY`. */
export const SUIT_STAGE = {
  height: 1.78,
  centerY: 0.9,
  distance: 3.45,
  fov: 36,
} as const;

function orbit(azimuthDeg: number, distance = SUIT_STAGE.distance, y = SUIT_STAGE.centerY): [number, number, number] {
  const azimuth = (azimuthDeg * Math.PI) / 180;
  return [Math.sin(azimuth) * distance, y, Math.cos(azimuth) * distance];
}

const LOOK_AT: [number, number, number] = [0, SUIT_STAGE.centerY, 0];

export const CAMERA_PRESETS: Record<CameraPresetKey, CameraPreset> = {
  "three-quarters": {
    key: "three-quarters",
    label: "3/4 Ракурс",
    position: orbit(34),
    target: LOOK_AT,
    fov: SUIT_STAGE.fov,
  },
  front: {
    key: "front",
    label: "Спереди",
    position: orbit(0),
    target: LOOK_AT,
    fov: SUIT_STAGE.fov,
  },
  side: {
    key: "side",
    label: "Сбоку",
    position: orbit(90),
    target: LOOK_AT,
    fov: SUIT_STAGE.fov,
  },
  back: {
    key: "back",
    label: "Со спины",
    position: orbit(180),
    target: LOOK_AT,
    fov: SUIT_STAGE.fov,
  },
  "close-lapel": {
    key: "close-lapel",
    label: "Лацканы и борт",
    position: [0.55, 1.28, 1.45],
    target: [0, 1.22, 0],
    fov: 32,
  },
  reset: {
    key: "reset",
    label: "Сброс камеры",
    position: orbit(34),
    target: LOOK_AT,
    fov: SUIT_STAGE.fov,
  },
};
