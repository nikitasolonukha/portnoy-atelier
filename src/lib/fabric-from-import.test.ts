import { describe, expect, it } from "vitest";
import { buildImportedFabric, photoAssetsFromUrl, swatchForColor } from "./fabric-from-import";

describe("fabric-from-import", () => {
  it("maps colors to catalog swatches", () => {
    expect(swatchForColor("Оливковый")).toBe("olive-twill");
    expect(swatchForColor("Коричневый")).toBe("brown-stripe");
  });

  it("builds photo assets from imageUrl", () => {
    const assets = photoAssetsFromUrl("http://localhost:3000/fabrics/import-pack/RE-3408-brown-chalk-stripe.png");
    expect(assets).toHaveLength(1);
    expect(assets?.[0]).toMatchObject({
      type: "photo",
      mimeType: "image/png",
      url: "/fabrics/import-pack/RE-3408-brown-chalk-stripe.png",
    });
  });

  it("attaches assets on imported fabric records", () => {
    const fabric = buildImportedFabric({
      article: "RE-3408",
      name: "Brown Chalk Stripe",
      mainColor: "Коричневый",
      imageUrl: "http://localhost:3000/fabrics/import-pack/RE-3408-brown-chalk-stripe.png",
    });
    expect(fabric.swatch).toBe("brown-stripe");
    expect(fabric.assets?.[0]?.url).toBe("/fabrics/import-pack/RE-3408-brown-chalk-stripe.png");
  });
});