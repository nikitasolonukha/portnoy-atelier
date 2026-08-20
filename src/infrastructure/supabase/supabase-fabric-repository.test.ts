import { describe, expect, it, vi } from "vitest";
import { ApiProblem } from "@/lib/api-response";
import { SupabaseFabricRepository } from "./supabase-fabric-repository";

function clientWithDelete(result: { error: { code?: string } | null; count: number | null }, existing: unknown = null) {
  const deleteEq = vi.fn(async () => result);
  const deleteBuilder = { eq: deleteEq };
  const selectMaybeSingle = vi.fn(async () => ({ data: existing, error: null }));
  const selectEq = vi.fn(() => ({ maybeSingle: selectMaybeSingle }));
  const selectBuilder = { eq: selectEq };
  return {
    from: vi.fn((table: string) => {
      if (table === "fabrics") {
        return {
          delete: vi.fn(() => deleteBuilder),
          select: vi.fn(() => selectBuilder),
        };
      }
      throw new Error(`Unexpected table ${table}`);
    }),
  };
}

describe("SupabaseFabricRepository.remove", () => {
  it("maps FK restrict to fabric_in_use with archive guidance", async () => {
    const client = clientWithDelete({ error: { code: "23503" }, count: null });
    const repository = new SupabaseFabricRepository(client as never);
    await expect(repository.remove("f1")).rejects.toMatchObject({
      code: "fabric_in_use",
      status: 409,
      message: expect.stringContaining("используется в конфигурации"),
    });
    await expect(repository.remove("f1")).rejects.toMatchObject({
      message: expect.stringContaining("Архивируйте ткань вместо удаления"),
    });
  });

  it("treats RLS zero-row deletes of an existing fabric as fabric_in_use", async () => {
    const client = clientWithDelete(
      { error: null, count: 0 },
      { id: "f1", article: "A1", name: "Wool", manufacturer: null, collection: null, composition: null, main_color: null, pattern: null, weight_gsm: null, width_cm: null, price_per_meter: null, currency: null, description: null, is_active: true, created_by: null, updated_by: null, created_at: "2026-08-18T00:00:00Z", updated_at: "2026-08-18T00:00:00Z", fabric_assets: [] },
    );
    const repository = new SupabaseFabricRepository(client as never);
    await expect(repository.remove("f1")).rejects.toBeInstanceOf(ApiProblem);
    await expect(repository.remove("f1")).rejects.toMatchObject({ code: "fabric_in_use", status: 409 });
  });

  it("returns false when the fabric is already gone", async () => {
    const client = clientWithDelete({ error: null, count: 0 }, null);
    const repository = new SupabaseFabricRepository(client as never);
    await expect(repository.remove("missing")).resolves.toBe(false);
  });
});
