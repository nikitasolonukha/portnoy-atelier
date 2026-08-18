import { describe, expect, it } from "vitest";
import { fabricInputSchema } from "./fabric";

describe("fabric schema", () => {
  it("accepts a minimal valid fabric", () => {
    expect(fabricInputSchema.parse({ article: "vb-2401", name: "Hopsack" }).article).toBe("VB-2401");
  });

  it("rejects missing required fields and negative numeric values", () => {
    expect(fabricInputSchema.safeParse({ article: "", name: "" }).success).toBe(false);
    expect(fabricInputSchema.safeParse({ article: "A", name: "B", weightGsm: -1 }).success).toBe(false);
  });
});
