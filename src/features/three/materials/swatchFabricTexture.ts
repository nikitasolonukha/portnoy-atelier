import * as THREE from "three";

export type FabricSwatchId =
  | "navy-weave"
  | "grey-check"
  | "charcoal"
  | "olive-twill"
  | "brown-stripe"
  | "sand-weave"
  | string;

/** Exact catalog swatch colors — keep in sync with `globals.css` `.navy-weave` etc. */
export const SWATCH_BASE: Record<string, string> = {
  "navy-weave": "#1e3450",
  "grey-check": "#6f716c",
  charcoal: "#2f302e",
  "olive-twill": "#565840",
  "brown-stripe": "#4f3f36",
  "sand-weave": "#a8987c",
};

const textureCache = new Map<string, THREE.CanvasTexture>();

function paintWeaveGrain(ctx: CanvasRenderingContext2D, size: number, strength = 6) {
  const step = 2;
  const image = ctx.getImageData(0, 0, size, size);
  const data = image.data;
  for (let y = 0; y < size; y += step) {
    for (let x = 0; x < size; x += step) {
      const isWeave = (Math.floor(x / step) + Math.floor(y / step)) % 2 === 0;
      const delta = (isWeave ? strength : -strength) + ((x * 13 + y * 7) % 5) - 2;
      for (let dy = 0; dy < step; dy += 1) {
        for (let dx = 0; dx < step; dx += 1) {
          const i = ((y + dy) * size + (x + dx)) * 4;
          data[i] = Math.min(255, Math.max(0, data[i] + delta));
          data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + delta));
          data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + delta));
        }
      }
    }
  }
  ctx.putImageData(image, 0, 0);
}

function fillLinearGradient(
  ctx: CanvasRenderingContext2D,
  size: number,
  angleDeg: number,
  stops: Array<[number, string]>,
) {
  const rad = (angleDeg * Math.PI) / 180;
  const x1 = size / 2 - Math.cos(rad) * size;
  const y1 = size / 2 - Math.sin(rad) * size;
  const x2 = size / 2 + Math.cos(rad) * size;
  const y2 = size / 2 + Math.sin(rad) * size;
  const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  for (const [t, color] of stops) gradient.addColorStop(t, color);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
}

/**
 * Canvas textures that match catalog CSS swatches (`.navy-weave`, `.grey-check`, …).
 * Used so the 3D jacket reads the same as the fabric picker cards.
 */
export function createSwatchFabricTexture(
  swatch: FabricSwatchId,
  type: "diffuse" | "bump" = "diffuse",
  patternType: "plain" | "herringbone" | "stripe" | "check" | "melange" | "twill" = "plain",
): THREE.CanvasTexture {
  const key = `${swatch || "charcoal"}_${type}_${patternType}`;
  const cached = textureCache.get(key);
  if (cached) return cached;

  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  if (type === "bump") {
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, size, size);
    paintWeaveGrain(ctx, size, patternType === "melange" ? 22 : 18);
  } else {
    const resolved =
      swatch === "charcoal" && patternType !== "plain"
        ? patternType === "stripe"
          ? "brown-stripe"
          : patternType === "check"
            ? "grey-check"
            : patternType === "twill"
              ? "olive-twill"
              : swatch
        : swatch;

    switch (resolved) {
      case "navy-weave":
        fillLinearGradient(ctx, size, 145, [
          [0, "#152536"],
          [0.4, "#1e3450"],
          [1, "#0f1a28"],
        ]);
        paintWeaveGrain(ctx, size, 5);
        break;
      case "grey-check": {
        ctx.fillStyle = SWATCH_BASE[swatch] ?? "#6f716c";
        ctx.fillRect(0, 0, size, size);
        paintWeaveGrain(ctx, size, 4);
        const tile = 64;
        for (let x = 0; x < size; x += tile) {
          ctx.fillStyle = "rgba(86, 28, 38, 0.75)";
          ctx.fillRect(x + tile * 0.47, 0, tile * 0.04, size);
        }
        for (let y = 0; y < size; y += tile) {
          ctx.fillStyle = "rgba(34, 35, 33, 0.5)";
          ctx.fillRect(0, y + tile * 0.47, size, tile * 0.04);
        }
        break;
      }
      case "charcoal":
        fillLinearGradient(ctx, size, 125, [
          [0, "#2f302e"],
          [0.42, "#4a4b48"],
          [1, "#222322"],
        ]);
        paintWeaveGrain(ctx, size, patternType === "melange" ? 10 : 6);
        if (patternType === "herringbone") {
          ctx.strokeStyle = "rgba(255,255,255,0.1)";
          ctx.lineWidth = 2;
          for (let i = -size; i < size * 2; i += 16) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 40, size / 2);
            ctx.lineTo(i, size);
            ctx.stroke();
          }
        }
        break;
      case "olive-twill": {
        ctx.fillStyle = SWATCH_BASE[swatch] ?? "#565840";
        ctx.fillRect(0, 0, size, size);
        paintWeaveGrain(ctx, size, 4);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx.lineWidth = 1;
        for (let i = -size; i < size * 2; i += 4) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + size * 0.7, size);
          ctx.stroke();
        }
        break;
      }
      case "brown-stripe": {
        ctx.fillStyle = SWATCH_BASE[swatch] ?? "#4f3f36";
        ctx.fillRect(0, 0, size, size);
        paintWeaveGrain(ctx, size, 4);
        const period = 68;
        for (let x = 32; x < size; x += period) {
          ctx.fillStyle = "rgba(235, 222, 201, 0.55)";
          ctx.fillRect(x, 0, 3, size);
        }
        break;
      }
      case "sand-weave":
        fillLinearGradient(ctx, size, 160, [
          [0, "#c4b59a"],
          [1, "#a8987c"],
        ]);
        paintWeaveGrain(ctx, size, 5);
        break;
      default: {
        const hex = SWATCH_BASE[swatch] ?? "#2a2d32";
        ctx.fillStyle = hex;
        ctx.fillRect(0, 0, size, size);
        paintWeaveGrain(ctx, size, 5);
        break;
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = type === "diffuse" ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  textureCache.set(key, texture);
  return texture;
}

export function swatchRepeat(swatch: FabricSwatchId): { u: number; v: number } {
  switch (swatch) {
    case "grey-check":
      return { u: 5, v: 5 };
    case "brown-stripe":
      return { u: 7, v: 7 };
    case "olive-twill":
      return { u: 14, v: 14 };
    case "navy-weave":
    case "charcoal":
    case "sand-weave":
      return { u: 16, v: 16 };
    default:
      return { u: 12, v: 12 };
  }
}

/** Test helper: clears canvas texture cache between unit runs. */
export function clearSwatchTextureCache() {
  for (const texture of textureCache.values()) texture.dispose();
  textureCache.clear();
}
