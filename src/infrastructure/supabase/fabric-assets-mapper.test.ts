import { describe, expect, it } from "vitest";
import { mapFabricRow } from "./fabric-mapper";

describe("fabric asset mapping", () => {
  it("maps private asset metadata to authenticated delivery URLs", () => {
    const fabric = mapFabricRow({
      id: "fabric-1",
      article: "A-1",
      name: "Wool",
      manufacturer: null,
      collection: null,
      composition: null,
      main_color: null,
      pattern: null,
      weight_gsm: null,
      width_cm: null,
      price_per_meter: null,
      currency: null,
      description: null,
      is_active: true,
      created_by: null,
      updated_by: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      fabric_assets: [{
        id: "asset-1",
        fabric_id: "fabric-1",
        type: "photo",
        storage_path: "fabric-1/photo.webp",
        original_filename: "photo.webp",
        mime_type: "image/webp",
        sort_order: 0,
        created_at: "2026-01-01T00:00:00Z",
      }],
    });

    expect(fabric.assets).toEqual([expect.objectContaining({
      id: "asset-1",
      type: "photo",
      url: "/api/v1/fabrics/fabric-1/assets/asset-1",
    })]);
  });
});
