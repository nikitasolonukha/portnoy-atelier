import * as THREE from "three";
import type { FabricMaterialProfile } from "./fabricTextureProfile";

const textureCache = new Map<string, THREE.CanvasTexture>();

/**
 * Creates high-fidelity procedural PBR CanvasTexture representing realistic fabric weave
 */
export function createProceduralFabricTexture(
  profile: FabricMaterialProfile,
  type: "diffuse" | "bump" = "diffuse"
): THREE.CanvasTexture {
  const cacheKey = `${profile.baseHex}_${profile.patternType}_${type}`;
  const existing = textureCache.get(cacheKey);
  if (existing) return existing;

  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    const dummy = new THREE.CanvasTexture(canvas);
    return dummy;
  }

  // Parse base color
  const baseColor = new THREE.Color(profile.baseHex);
  const r = Math.round(baseColor.r * 255);
  const g = Math.round(baseColor.g * 255);
  const b = Math.round(baseColor.b * 255);

  if (type === "bump") {
    // Render high frequency yarn height map
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, size, size);

    const step = 2; // Finer grain
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        const isWeave = (Math.floor(x / step) + Math.floor(y / step)) % 2 === 0;
        const noise = (Math.random() - 0.5) * 15; // less harsh
        const val = Math.min(255, Math.max(0, (isWeave ? 140 : 116) + noise));
        ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
        ctx.fillRect(x, y, step, step);
      }
    }
  } else {
    // Fill base tone
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, size, size);

    // Add subtle yarn weave texture
    const step = 2;
    for (let y = 0; y < size; y += step) {
      for (let x = 0; x < size; x += step) {
        const isWeave = (Math.floor(x / step) + Math.floor(y / step)) % 2 === 0;
        const noise = (Math.random() - 0.5) * 8; // subtle
        const delta = (isWeave ? 3 : -3) + noise;
        const cr = Math.min(255, Math.max(0, r + delta));
        const cg = Math.min(255, Math.max(0, g + delta));
        const cb = Math.min(255, Math.max(0, b + delta));
        ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
        ctx.fillRect(x, y, step, step);
      }
    }

    // Pattern Overlays (Subtle)
    if (profile.patternType === "stripe") {
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = `rgba(255, 255, 255, 0.12)`;
      for (let x = 0; x < size; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size);
        ctx.stroke();
      }
    } else if (profile.patternType === "check") {
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(255, 255, 255, 0.08)`;
      for (let x = 0; x < size; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, size);
        ctx.stroke();
      }
      for (let y = 0; y < size; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(size, y);
        ctx.stroke();
      }
    } else if (profile.patternType === "herringbone") {
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = `rgba(0, 0, 0, 0.08)`;
      const zigStep = 16;
      for (let x = 0; x < size; x += zigStep) {
        ctx.beginPath();
        for (let y = 0; y < size; y += zigStep) {
          if ((y / zigStep) % 2 === 0) {
            ctx.moveTo(x, y);
            ctx.lineTo(x + zigStep, y + zigStep);
          } else {
            ctx.moveTo(x + zigStep, y);
            ctx.lineTo(x, y + zigStep);
          }
        }
        ctx.stroke();
      }
    } else if (profile.patternType === "twill") {
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = `rgba(0, 0, 0, 0.05)`;
      for (let x = -size; x < size * 2; x += 8) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + size, size);
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(profile.repeatU, profile.repeatV);
  texture.colorSpace = type === "diffuse" ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.needsUpdate = true;

  textureCache.set(cacheKey, texture);
  return texture;
}
