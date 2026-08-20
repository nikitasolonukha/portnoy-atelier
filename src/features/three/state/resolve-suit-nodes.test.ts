import { describe, expect, it } from "vitest";
import {
  describeActiveConstruction,
  resolveSuitVisibleNodes,
} from "./resolve-suit-nodes";
import { DEFAULT_SUIT_VISUAL_STATE } from "./derive-suit-visual-state";

describe("resolveSuitVisibleNodes phase 1", () => {
  it("maps single jacket to JACKET_SINGLE_NOTCH regardless of lapel UI choice", () => {
    expect(
      resolveSuitVisibleNodes({ ...DEFAULT_SUIT_VISUAL_STATE, jacket: "single", lapel: "peak" }),
    ).toContain("JACKET_SINGLE_NOTCH");
    expect(
      resolveSuitVisibleNodes({ ...DEFAULT_SUIT_VISUAL_STATE, jacket: "single", lapel: "peak" }),
    ).not.toContain("JACKET_DOUBLE_PEAK");
  });

  it("maps double jacket to JACKET_DOUBLE_PEAK", () => {
    expect(
      resolveSuitVisibleNodes({ ...DEFAULT_SUIT_VISUAL_STATE, jacket: "double", lapel: "notch" }),
    ).toEqual(expect.arrayContaining(["JACKET_DOUBLE_PEAK", "TROUSERS_CLASSIC"]));
  });

  it("shows VEST_SINGLE when vest is requested", () => {
    expect(
      resolveSuitVisibleNodes({ ...DEFAULT_SUIT_VISUAL_STATE, vest: "single" }),
    ).toContain("VEST_SINGLE");
    expect(
      resolveSuitVisibleNodes({ ...DEFAULT_SUIT_VISUAL_STATE, vest: "none" }),
    ).not.toContain("VEST_SINGLE");
  });

  it("describes the honest phase-1 construction", () => {
    expect(
      describeActiveConstruction({
        ...DEFAULT_SUIT_VISUAL_STATE,
        jacket: "double",
        lapel: "peak",
        vest: "single",
      }),
    ).toBe("double (2D)/peak · vest single (2D)");
  });
});
