import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { SWATCH_BASE, clearSwatchTextureCache, swatchRepeat } from "./swatchFabricTexture";

describe("swatchFabricTexture", () => {
  beforeEach(() => {
    clearSwatchTextureCache();
  });

  afterEach(() => {
    clearSwatchTextureCache();
  });

  it("maps catalog swatches to the CSS base colors", () => {
    expect(SWATCH_BASE["navy-weave"]).toBe("#1e3450");
    expect(SWATCH_BASE["grey-check"]).toBe("#6f716c");
    expect(SWATCH_BASE.charcoal).toBe("#2f302e");
    expect(SWATCH_BASE["olive-twill"]).toBe("#565840");
    expect(SWATCH_BASE["brown-stripe"]).toBe("#4f3f36");
  });

  it("uses coarser repeat for check and stripe so patterns stay readable on the jacket", () => {
    expect(swatchRepeat("grey-check").u).toBeLessThan(swatchRepeat("navy-weave").u);
    expect(swatchRepeat("brown-stripe").u).toBeLessThan(swatchRepeat("charcoal").u);
  });
});
