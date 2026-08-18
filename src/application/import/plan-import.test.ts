import { describe, expect, it } from "vitest";
import { planFabricImport } from "./plan-import";

describe("fabric import plan", () => {
  const existing = new Set(["EX-1"]);

  it("skips existing articles without marking them invalid", () => {
    const result = planFabricImport([{ article: "EX-1", name: "Existing" }], existing, "skip");
    expect(result.invalid).toHaveLength(0);
    expect(result.update).toHaveLength(0);
  });

  it("splits creates and updates for update strategy", () => {
    const result = planFabricImport([
      { article: "EX-1", name: "Updated" },
      { article: "NEW-1", name: "New" },
    ], existing, "update");
    expect(result.create).toHaveLength(1);
    expect(result.update).toHaveLength(1);
  });

  it("marks duplicates within the same file", () => {
    const result = planFabricImport([
      { article: "NEW-1", name: "First" },
      { article: "NEW-1", name: "Second" },
    ], new Set(), "skip");
    expect(result.invalid[0]?.row).toBe(3);
  });
});
