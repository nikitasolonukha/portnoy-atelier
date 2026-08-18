import { describe, expect, it } from "vitest";
import { planFabricImport } from "./plan-import";

describe("fabric import plan", () => {
  const existing = new Set(["EX-1"]);

  it("rejects duplicates when strategy is reject", () => {
    const result = planFabricImport([{ article: "EX-1", name: "Existing" }], existing, "reject");
    expect(result.invalid[0]?.issues).toContain("Артикул уже существует");
  });

  it("splits creates and updates for upsert", () => {
    const result = planFabricImport([
      { article: "EX-1", name: "Updated" },
      { article: "NEW-1", name: "New" },
    ], existing, "upsert");
    expect(result.create).toHaveLength(1);
    expect(result.update).toHaveLength(1);
  });

  it("marks duplicates within the same file", () => {
    const result = planFabricImport([
      { article: "NEW-1", name: "First" },
      { article: "NEW-1", name: "Second" },
    ], new Set(), "reject");
    expect(result.invalid[0]?.row).toBe(3);
  });
});
