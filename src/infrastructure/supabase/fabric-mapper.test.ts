import { describe, expect, it } from "vitest";
import { fabricInputSchema } from "@/schemas/fabric";
import { mapFabricInsert, mapFabricRow } from "./fabric-mapper";

describe("Supabase fabric mapper", () => {
  it("maps snake_case database rows to the domain model", () => {
    const fabric = mapFabricRow({
      id: "f1", article: "VB-1", name: "Hopsack", manufacturer: null, collection: null,
      composition: null, main_color: "Синий", pattern: null, weight_gsm: null, width_cm: null,
      price_per_meter: null, currency: null, description: null, is_active: true,
      created_by: null, updated_by: null, created_at: "2026-08-18T00:00:00Z", updated_at: "2026-08-18T00:00:00Z",
    });
    expect(fabric.manufacturer).toBe("");
    expect(fabric.mainColor).toBe("Синий");
    expect(fabric.currency).toBe("RUB");
  });

  it("maps validated input to a database insert without UI-only fields", () => {
    expect(mapFabricInsert(fabricInputSchema.parse({ article: "VB-1", name: "Hopsack", currency: "RUB" }), "user-1")).toMatchObject({
      article: "VB-1", name: "Hopsack", currency: "RUB", created_by: "user-1", updated_by: "user-1",
    });
  });
});
