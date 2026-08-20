import { describe, expect, it } from "vitest";
import { DEFAULT_SUIT_VISUAL_STATE, deriveSuitVisualState } from "./derive-suit-visual-state";

describe("deriveSuitVisualState", () => {
  it("returns defaults for missing or invalid settings", () => {
    expect(deriveSuitVisualState()).toEqual(DEFAULT_SUIT_VISUAL_STATE);
    expect(deriveSuitVisualState(null)).toEqual(DEFAULT_SUIT_VISUAL_STATE);
    expect(
      deriveSuitVisualState({
        jacket: "triple",
        lapel: "wide",
        buttons: "four",
        pockets: "ticket",
        trousers: "skinny",
        vest: "yes",
      }),
    ).toEqual(DEFAULT_SUIT_VISUAL_STATE);
  });

  it("reads canonical and alias keys", () => {
    expect(
      deriveSuitVisualState({
        "jacket-type": "double",
        "lapel-type": "peak",
        "button-layout": "one",
        "pocket-type": "patch",
        "trousers-pleats": "pleated",
        waistcoat: "single",
      }),
    ).toEqual({
      jacket: "double",
      lapel: "peak",
      buttons: "one",
      pockets: "patch",
      trousers: "pleated",
      vest: "single",
    });
  });
});
