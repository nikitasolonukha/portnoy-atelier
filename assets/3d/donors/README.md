# Donor assets drop folder

Put Sketchfab downloads here. See `docs/3D_ATTRIBUTION.md`.

## Phase 1 required layout

```text
assets/3d/donors/
  suit-jacket.glb
    OR suit-jacket/scene.gltf  (+ bin/textures)
  double-breasted-blazer.glb
    OR double-breasted-blazer/scene.gltf
  fashionable-waistcoat.glb
    OR fashionable-waistcoat/scene.gltf
```

## Optional

```text
  classic-suit.glb | classic-suit/scene.gltf
  business-suit.glb | business-suit/scene.gltf
  clothing-kit-cc0.glb | clothing-kit-cc0/scene.gltf
```

After dropping files:

```bash
pnpm 3d:check-donors
pnpm 3d:build-modular
```

Output: `public/models/suit-configurable-v3.glb`
