import type { Fabric } from "@/types/domain";
import { SWATCH_BASE } from "./swatchFabricTexture";

export type FabricMaterialProfile = {
  roughness: number;
  metalness: number;
  sheen: number;
  sheenRoughness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  repeatU: number;
  repeatV: number;
  bumpScale: number;
  baseHex: string;
  swatch: string;
  patternType: "plain" | "herringbone" | "stripe" | "check" | "melange" | "twill";
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

export function getFabricBaseHex(fabric?: Fabric | null): string {
  if (!fabric) return "#22252A";
  if (fabric.swatch && SWATCH_BASE[fabric.swatch]) return SWATCH_BASE[fabric.swatch];

  const name = (fabric.name + " " + fabric.mainColor + " " + fabric.swatch).toLowerCase();
  let hex = "#232832";
  if (name.includes("charcoal") || name.includes("темно-серый") || name.includes("угол")) hex = "#252729";
  else if (name.includes("navy") || name.includes("темно-синий") || name.includes("синий") || name.includes("midnight")) hex = "#1C2434";
  else if (name.includes("royal") || name.includes("василь")) hex = "#22314E";
  else if (name.includes("olive") || name.includes("оливк") || name.includes("зелен")) hex = "#343B31";
  else if (name.includes("sand") || name.includes("бежев") || name.includes("camel") || name.includes("песоч")) hex = "#968A78";
  else if (name.includes("maroon") || name.includes("бордов") || name.includes("вино") || name.includes("burgundy")) hex = "#4A1823";
  else if (name.includes("grey") || name.includes("серый") || name.includes("silver")) hex = "#4E5358";
  else if (name.includes("brown") || name.includes("коричн") || name.includes("шоколад")) hex = "#3B2E28";

  const hash = hashString(fabric.article || fabric.id || "123");
  const variation = (Math.abs(hash) % 15) - 7;
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + variation));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + variation));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + variation));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function getFabricTextureProfile(fabric?: Fabric | null): FabricMaterialProfile {
  const swatch = fabric?.swatch || "charcoal";
  const baseHex = getFabricBaseHex(fabric);
  const pattern = (fabric?.pattern || "").toLowerCase();
  const composition = (fabric?.composition || "").toLowerCase();

  let patternType: FabricMaterialProfile["patternType"] = "plain";
  if (pattern.includes("полос") || pattern.includes("stripe") || pattern.includes("pinstripe") || swatch === "brown-stripe") {
    patternType = "stripe";
  } else if (pattern.includes("клетк") || pattern.includes("check") || pattern.includes("glen") || swatch === "grey-check") {
    patternType = "check";
  } else if (pattern.includes("елочк") || pattern.includes("herringbone")) {
    patternType = "herringbone";
  } else if (pattern.includes("твил") || pattern.includes("twill") || pattern.includes("диагональ") || swatch === "olive-twill") {
    patternType = "twill";
  } else if (pattern.includes("меланж") || pattern.includes("melange")) {
    patternType = "melange";
  }

  let roughness = 0.82;
  let sheen = 0.12;
  let sheenRoughness = 0.85;
  let clearcoat = 0.02;
  let clearcoatRoughness = 0.55;
  let bumpScale = 0.018;

  if (composition.includes("кашемир") || composition.includes("cashmere") || composition.includes("super 150")) {
    roughness = 0.72;
    sheen = 0.28;
    sheenRoughness = 0.7;
    clearcoat = 0.08;
    bumpScale = 0.01;
  } else if (swatch === "charcoal" || patternType === "melange") {
    roughness = 0.92;
    sheen = 0.08;
    bumpScale = 0.022;
  } else if (swatch === "olive-twill") {
    roughness = 0.7;
    sheen = 0.22;
    clearcoat = 0.1;
  }

  return {
    baseHex,
    swatch,
    roughness,
    metalness: 0.0,
    sheen,
    sheenRoughness,
    clearcoat,
    clearcoatRoughness,
    repeatU: 12,
    repeatV: 12,
    bumpScale,
    patternType,
  };
}
