import { describe, expect, it } from "vitest";
import { fabricPhoto, fabricSurfaceMap, fabricTexture } from "./fabric-visual";

const photo = {
  id: "p1",
  type: "photo" as const,
  originalFilename: "a.png",
  mimeType: "image/png",
  sortOrder: 0,
  url: "/fabrics/import-pack/RE-3408.png",
};

const texture = {
  id: "t1",
  type: "texture" as const,
  originalFilename: "a.jpg",
  mimeType: "image/jpeg",
  sortOrder: 0,
  url: "/textures/fabrics/reda.jpg",
};

describe("fabric-visual", () => {
  it("prefers texture assets for surface maps, then photo", () => {
    expect(fabricSurfaceMap({ assets: [photo] })?.url).toContain("RE-3408");
    expect(fabricSurfaceMap({ assets: [photo, texture] })?.url).toContain("/textures/");
    expect(fabricTexture({ assets: [photo] })).toBeUndefined();
    expect(fabricPhoto({ assets: [photo] })?.type).toBe("photo");
  });

  it("uses the lowest sortOrder photo as the main catalog image", () => {
    const secondary = { ...photo, id: "p0", sortOrder: 2, url: "/secondary.png" };
    const primary = { ...photo, id: "p2", sortOrder: 0, url: "/primary.png" };
    expect(fabricPhoto({ assets: [secondary, primary] })?.url).toBe("/primary.png");
  });
});
