import { describe, expect, it } from "vitest";
import { fabricPatchSchema } from "./fabric";

describe("fabric patch schema", () => {
  it("accepts archive state without requiring form fields", () => {
    expect(fabricPatchSchema.parse({ isActive: false })).toEqual({ isActive: false });
  });
});
