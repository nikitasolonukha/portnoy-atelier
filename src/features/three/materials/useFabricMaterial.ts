"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import type { Fabric } from "@/types/domain";
import { fabricSurfaceMap } from "@/lib/fabric-visual";
import { getFabricTextureProfile } from "./fabricTextureProfile";
import { createSwatchFabricTexture, swatchRepeat } from "./swatchFabricTexture";

export type SuitMaterialsMap = {
  fabricMaterial: THREE.MeshPhysicalMaterial;
  buttonMaterial: THREE.MeshStandardMaterial;
  liningMaterial: THREE.MeshStandardMaterial;
  metalMaterial: THREE.MeshStandardMaterial;
  feltMaterial: THREE.MeshStandardMaterial;
};

/** Photo/texture maps are full swatches — keep repeat low so patterns stay distinct on the jacket. */
export function surfaceMapRepeat(
  hasSurfaceImage: boolean,
  swatch: string,
  patternType: "plain" | "herringbone" | "stripe" | "check" | "melange" | "twill" = "plain",
): { u: number; v: number } {
  if (hasSurfaceImage) return { u: 3.25, v: 3.25 };
  if (swatch === "charcoal" && patternType === "stripe") return swatchRepeat("brown-stripe");
  if (swatch === "charcoal" && patternType === "check") return swatchRepeat("grey-check");
  if (swatch === "charcoal" && patternType === "twill") return swatchRepeat("olive-twill");
  return swatchRepeat(swatch);
}

export function useFabricMaterial(fabric?: Fabric | null): SuitMaterialsMap {
  const profile = useMemo(() => getFabricTextureProfile(fabric), [fabric]);
  const surfaceUrl = fabricSurfaceMap(fabric ?? { assets: [] })?.url ?? null;
  const [surfaceTexture, setSurfaceTexture] = useState<THREE.Texture | null>(null);
  const activeSurfaceTexture = surfaceUrl ? surfaceTexture : null;

  useEffect(() => {
    if (!surfaceUrl) return;

    let cancelled = false;
    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      surfaceUrl,
      (tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        tex.needsUpdate = true;
        setSurfaceTexture(tex);
      },
      undefined,
      () => {
        if (!cancelled) setSurfaceTexture(null);
      },
    );

    return () => {
      cancelled = true;
      texture.dispose();
    };
  }, [surfaceUrl]);

  const materials = useMemo(() => {
    const swatch = profile.swatch;
    const repeat = surfaceMapRepeat(Boolean(activeSurfaceTexture), swatch, profile.patternType);
    const diffuseSource = activeSurfaceTexture ?? createSwatchFabricTexture(swatch, "diffuse", profile.patternType);
    const bumpSource = createSwatchFabricTexture(swatch, "bump", profile.patternType);
    // Always clone before mutating wrap/repeat so React state-owned textures stay untouched.
    const diffuse = diffuseSource.clone();
    const bump = bumpSource.clone();
    diffuse.wrapS = THREE.RepeatWrapping;
    diffuse.wrapT = THREE.RepeatWrapping;
    bump.wrapS = THREE.RepeatWrapping;
    bump.wrapT = THREE.RepeatWrapping;
    diffuse.repeat.set(repeat.u, repeat.v);
    bump.repeat.set(repeat.u, repeat.v);
    if ("colorSpace" in diffuse) {
      diffuse.colorSpace = THREE.SRGBColorSpace;
    }

    const fabricMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xffffff),
      map: diffuse,
      bumpMap: bump,
      bumpScale: activeSurfaceTexture ? Math.min(profile.bumpScale, 0.012) : profile.bumpScale,
      roughness: profile.roughness,
      metalness: profile.metalness,
      sheen: profile.sheen,
      sheenRoughness: profile.sheenRoughness,
      sheenColor: new THREE.Color(profile.baseHex).offsetHSL(0, 0, 0.15),
      clearcoat: profile.clearcoat,
      clearcoatRoughness: profile.clearcoatRoughness,
      side: THREE.DoubleSide,
    });

    const buttonMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#1B1A18"),
      roughness: 0.28,
      metalness: 0.15,
    });

    const liningMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#2C3038"),
      roughness: 0.35,
      metalness: 0.2,
    });

    const metalMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#B8B3AA"),
      roughness: 0.25,
      metalness: 0.85,
    });

    const feltMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#383C42"),
      roughness: 0.95,
      metalness: 0.0,
    });

    return {
      fabricMaterial,
      buttonMaterial,
      liningMaterial,
      metalMaterial,
      feltMaterial,
    };
  }, [profile, activeSurfaceTexture]);

  useEffect(() => {
    return () => {
      // Do not dispose map/bumpMap: clones may share image data with the swatch cache / loader.
      materials.fabricMaterial.dispose();
      materials.buttonMaterial.dispose();
      materials.liningMaterial.dispose();
      materials.metalMaterial.dispose();
      materials.feltMaterial.dispose();
    };
  }, [materials]);

  return materials;
}
