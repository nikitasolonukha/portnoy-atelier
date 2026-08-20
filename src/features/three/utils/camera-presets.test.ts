import { describe, expect, it } from "vitest";
import { CAMERA_PRESETS, SUIT_STAGE } from "./camera-presets";

describe("suit stage framing", () => {
  it("looks at the standing figure center so the suit sits in the viewport", () => {
    for (const key of ["three-quarters", "front", "side", "back", "reset"] as const) {
      expect(CAMERA_PRESETS[key].target).toEqual([0, SUIT_STAGE.centerY, 0]);
      expect(CAMERA_PRESETS[key].position[1]).toBe(SUIT_STAGE.centerY);
    }
  });

  it("keeps a viewing distance that fits the full figure without fullscreen", () => {
    const [x, , z] = CAMERA_PRESETS["three-quarters"].position;
    expect(Math.hypot(x, z)).toBeGreaterThan(3.2);
    expect(CAMERA_PRESETS.front.position[2]).toBe(SUIT_STAGE.distance);
  });
});
