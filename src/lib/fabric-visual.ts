import type { Fabric, FabricAsset } from "@/types/domain";

export function fabricPhoto(fabric: Pick<Fabric, "assets">) {
  return (fabric.assets ?? []).find((asset) => asset.type === "photo");
}

export function fabricTexture(fabric: Pick<Fabric, "assets">) {
  return (fabric.assets ?? []).find((asset) => asset.type === "texture");
}

/** Prefer a dedicated texture; fall back to catalog photo so the jacket matches the swatch card. */
export function fabricSurfaceMap(fabric: Pick<Fabric, "assets">): FabricAsset | undefined {
  return fabricTexture(fabric) ?? fabricPhoto(fabric);
}
