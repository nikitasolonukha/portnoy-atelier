# Portnoy Atelier — Production 3D Suit Asset Specification

This document defines the strict asset standards for the final high-fashion 3D suit model (.GLB) to ensure 100% plug-and-play compatibility with the Portnoy Atelier 3D viewer.

---

## 1. File Format & Standards

- **Format:** `glTF 2.0 Binary (.glb)`
- **Coordinate System:** Right-handed, `Y-Up`, `Z-Forward`
- **Units:** Metric (`1 unit = 1 meter`)
- **Pivot / Origin:** Centered at `(0, 0, 0)` at floor contact level between the trouser cuffs.
- **Model Height:** Total height ~1.82m (standard tailored showroom mannequin proportion).

---

## 2. Triangle & Geometry Budget

- **Target Triangles:** `< 120,000` triangles total across all visible nodes.
- **Draw Calls:** `< 40` draw calls in standard configuration.
- **Mesh Structure:** Clean quads converted to triangles, smooth normals, non-destructive bevels on lapel edges, pockets, and seams.
- **Pivots:** All interchangeable modular nodes MUST share the common origin `(0, 0, 0)`.

---

## 3. Node Hierarchy & Naming Convention

### Preferred phase-1 whole-jacket variants

Donor jackets often bake lapels into the garment. Prefer whole variants over overlay lapels:

- `JACKET_SINGLE_NOTCH` — single-breasted + notch (Suit Jacket donor)
- `JACKET_DOUBLE_PEAK` — double-breasted + peak (Formal Blazer donor)
- `VEST_SINGLE` — Fashionable Waistcoat donor
- `TROUSERS_CLASSIC` — from Classic Suit / kit (optional phase 1)

Runtime maps business `jacket` + `lapel` through `resolveSuitVisibleNodes` so UI keys stay stable.

### Full modular target (phase 2+)

Every mesh in the `.glb` should match the semantic names below when split parts exist:

### A. Jacket Body
- `JACKET_SINGLE_BODY`: Single-breasted tailored torso with open quarters.
- `JACKET_DOUBLE_BODY`: Double-breasted tailored torso with wrap-over front.
- `COLLAR_BASE`: Rear stand collar.
- `SLEEVE_L`: Left tailored curved sleeve.
- `SLEEVE_R`: Right tailored curved sleeve.

### B. Lapels (Separate interchangeable meshes)
- `LAPEL_NOTCH_L`, `LAPEL_NOTCH_R`: Classic notch lapel step.
- `LAPEL_PEAK_L`, `LAPEL_PEAK_R`: Peak lapel upward pointing tips.
- `LAPEL_SHAWL_L`, `LAPEL_SHAWL_R`: Smooth continuous shawl curve.

### C. Pockets
- `POCKET_FLAP_L`, `POCKET_FLAP_R`: Angled welt flap pockets.
- `POCKET_JETTED_L`, `POCKET_JETTED_R`: Double-piped jetted slits.
- `POCKET_PATCH_L`, `POCKET_PATCH_R`: Rounded external patch pockets.
- `POCKET_CHEST_WELT`: Left chest welt (Barchetta) pocket.

### D. Buttons
- `BUTTON_FRONT_1`: Top/single closure button.
- `BUTTON_FRONT_2`: Middle/second closure button.
- `BUTTON_FRONT_3`: Lower button for three-roll-two.
- `BUTTON_DB_ARRAY`: 6x2 double-breasted button matrix.
- `BUTTON_CUFF_L`, `BUTTON_CUFF_R`: 4 kissing/stacked cuff sleeve buttons.

### E. Trousers
- `TROUSERS_BASE`: Tailored trousers with crease line and waistband.
- `PLEAT_L_1`, `PLEAT_R_1`: Single forward pleat mesh.
- `PLEAT_L_2`, `PLEAT_R_2`: Second outer pleat mesh.

### F. Vest (Waistcoat)
- `VEST_SINGLE_BODY`: Single-breasted 5-button V-point vest.
- `VEST_DOUBLE_BODY`: Double-breasted shawl vest.
- `BUTTON_VEST_ARRAY`: Vest button row.
- `VEST_BACK_SATIN`: Rear satin lining and cinch buckle.

---

## 4. UV Mapping Guidelines

1. **UV Space:** UV0 (0 to 1 range), non-overlapping per garment piece.
2. **Grain Line & Alignment:**
   - Front panels, back panels, lapels, and trouser legs MUST align with the vertical V axis (`Y-axis`) for correct grainline of striped and checked fabrics.
   - Lapel UVs must follow the lapel roll line so pinstripes flow naturally along the collar edge.
3. **Texel Density:** Consistent texel density (~2048 px/m) across all main fabric elements.

---

## 5. Material Slot Assignments

1. `FABRIC_MAIN`: Assigned to all exterior shell meshes (Jacket, Lapels, Pockets, Trousers, Vest front).
2. `BUTTON_MATERIAL`: Assigned to horn/corozo buttons.
3. `LINING_MATERIAL`: Assigned to interior chest lining and vest back.
4. `FELT_MATERIAL`: Assigned to undercollar melton felt and mannequin finial.

---

## 6. Export Checklist

- [ ] Unused bones, lights, and cameras removed from `.glb`.
- [ ] Transforms applied (`Scale = 1.0, 1.0, 1.0`, `Rotation = 0, 0, 0`).
- [ ] Normals recalculated outside (no inverted faces).
- [ ] Compression: glTF-Transform meshopt/Draco optional for web optimization.
