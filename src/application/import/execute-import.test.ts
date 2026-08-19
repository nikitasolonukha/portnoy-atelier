import { describe, expect, it, vi } from "vitest";
import type { FabricRepository } from "@/application/ports/fabric-repository";
import type { Fabric } from "@/types/domain";
import { executeFabricImport } from "./execute-import";

function fabric(id: string, article: string): Fabric {
  return {
    id,
    article,
    name: article,
    manufacturer: "Test mill",
    composition: "Wool",
    mainColor: "Blue",
    pattern: "Solid",
    weightGsm: 250,
    widthCm: 150,
    pricePerMeter: 1000,
    currency: "RUB",
    isActive: true,
    swatch: "swatch-navy",
    assets: [],
    createdAt: "2026-08-19T00:00:00Z",
    updatedAt: "2026-08-19T00:00:00Z",
  };
}

function repository(existing: Record<string, Fabric> = {}): FabricRepository {
  return {
    list: vi.fn(),
    findById: vi.fn(),
    findByArticle: vi.fn(async (article: string) => existing[article] ?? null),
    create: vi.fn(async (input) => fabric(`created-${input.article}`, input.article)),
    update: vi.fn(async (id, input) => fabric(id, input.article ?? "updated")),
    archive: vi.fn(),
    remove: vi.fn(),
  };
}

describe("executeFabricImport", () => {
  it("creates, updates and skips existing fabrics according to strategy", async () => {
    const existing = fabric("existing-1", "EX-1");
    const updateRepository = repository({ "EX-1": existing });
    const updated = await executeFabricImport([
      { article: "NEW-1", name: "New" },
      { article: "EX-1", name: "Updated" },
    ], "update", updateRepository, "actor-1");
    expect(updated).toMatchObject({ created: 1, updated: 1, skipped: 0, failed: 0, partial: false, errors: [] });
    expect(updateRepository.update).toHaveBeenCalledWith("existing-1", expect.objectContaining({ article: "EX-1" }), "actor-1");

    const skipRepository = repository({ "EX-1": existing });
    await expect(executeFabricImport([{ article: "EX-1", name: "Existing" }], "skip", skipRepository, "actor-1"))
      .resolves.toMatchObject({ created: 0, updated: 0, skipped: 1, failed: 0, partial: false });
    expect(skipRepository.update).not.toHaveBeenCalled();
  });

  it("returns row-level validation and duplicate errors while preserving successful rows", async () => {
    const result = await executeFabricImport([
      { article: "", name: "Invalid" },
      { article: "OK-1", name: "Valid" },
      { article: "OK-1", name: "Duplicate" },
    ], "update", repository(), "actor-1");
    expect(result).toMatchObject({ created: 1, updated: 0, skipped: 0, failed: 2, partial: true });
    expect(result.errors.map((error) => ({ row: error.row, article: error.article }))).toEqual([
      { row: 2, article: "" },
      { row: 4, article: "OK-1" },
    ]);
    expect(result.errors[1]?.message).toBe("Артикул повторяется в файле");
  });

  it("preserves every unmapped field when updating an existing fabric", async () => {
    const existing = { ...fabric("existing-1", "EX-1"), manufacturer: "Loro Piana", composition: "100% Wool", currency: "EUR" as const };
    const target = repository({ "EX-1": existing });

    await executeFabricImport([{ article: "EX-1", name: "Updated navy" }], "update", target, "actor-1");

    expect(target.update).toHaveBeenCalledWith("existing-1", { article: "EX-1", name: "Updated navy" }, "actor-1");
  });

  it("updates a mapped optional field", async () => {
    const target = repository({ "EX-1": fabric("existing-1", "EX-1") });

    await executeFabricImport([{ article: "EX-1", name: "Updated", manufacturer: "Vitale Barberis" }], "update", target, "actor-1");

    expect(target.update).toHaveBeenCalledWith("existing-1", { article: "EX-1", name: "Updated", manufacturer: "Vitale Barberis" }, "actor-1");
  });

  it("treats a mapped blank text cell as an explicit clear", async () => {
    const target = repository({ "EX-1": fabric("existing-1", "EX-1") });

    await executeFabricImport([{ article: "EX-1", name: "Updated", manufacturer: "" }], "update", target, "actor-1");

    expect(target.update).toHaveBeenCalledWith("existing-1", { article: "EX-1", name: "Updated", manufacturer: "" }, "actor-1");
  });
  it("converts repository failures into safe per-row results", async () => {
    const failing = repository({ "EX-1": fabric("missing", "EX-1") });
    vi.mocked(failing.update).mockResolvedValueOnce(null);
    vi.mocked(failing.create).mockRejectedValueOnce("non-error");
    const result = await executeFabricImport([
      { article: "EX-1", name: "Gone" },
      { article: "NEW-1", name: "Broken" },
    ], "update", failing, "actor-1");
    expect(result).toMatchObject({ created: 0, updated: 0, skipped: 0, failed: 2, partial: false });
    expect(result.errors.map((error) => error.message)).toEqual([
      "Ткань не найдена во время обновления",
      "Не удалось импортировать строку",
    ]);
  });
});
