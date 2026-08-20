import { describe, expect, it } from "vitest";
import { surfaceMapRepeat } from "./useFabricMaterial";

describe("surfaceMapRepeat", () => {
  it("keeps photo maps coarse so stripe/check stay readable", () => {
    expect(surfaceMapRepeat(true, "charcoal").u).toBeLessThan(8);
  });

  it("uses pattern-aware swatch tiling when no photo is present", () => {
    expect(surfaceMapRepeat(false, "charcoal", "stripe").u).toBe(7);
    expect(surfaceMapRepeat(false, "charcoal", "check").u).toBe(5);
    expect(surfaceMapRepeat(false, "navy-weave", "plain").u).toBe(16);
  });
});
