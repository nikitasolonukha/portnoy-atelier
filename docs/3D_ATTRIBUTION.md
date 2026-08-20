# 3D Attribution — Modular Suit Donors

Portnoy Atelier modular suit (`public/models/suit-configurable-v3.glb`) is assembled from free Sketchfab models that allow modification. Attribution must travel with the product.

Licenses used: **CC BY** (attribution required) and author-declared **CC0** (kit below is listed CC BY on Sketchfab UI; author text claims CC0 — keep attribution anyway).

Do **not** use NoAI, CC BY-ND, CC BY-NC, or Personal Use Only assets.

---

## Phase 1 donors (required)

### 1. Suit Jacket — single / notch baseline

| Field | Value |
|---|---|
| Title | Suit Jacket |
| Author | ExposedLeaf |
| URL | https://sketchfab.com/3d-models/suit-jacket-8aa66be29de94480bb28e42330dd6d80 |
| UID | `8aa66be29de94480bb28e42330dd6d80` |
| License | CC Attribution |
| Tris | ~8.8k |
| Used for | `JACKET_SINGLE_NOTCH` baseline; shawl edit source (phase 2) |
| Modifications | Scale/pose normalize; strip non-garment; rename; shared `FABRIC_MAIN` |

**Local path:** `assets/3d/donors/suit-jacket/` (extracted glTF) or `assets/3d/donors/suit-jacket.glb`

### 2. Double-Breasted Formal Blazer — double / peak

| Field | Value |
|---|---|
| Title | Double-Breasted Formal Blazer |
| Author | SathwikBannu (@sathwik.sai24) |
| URL | https://sketchfab.com/3d-models/double-breasted-formal-blazer-9e19a3739042402ca7c27b7384923c22 |
| UID | `9e19a3739042402ca7c27b7384923c22` |
| License | CC Attribution |
| Tris | ~66.3k |
| Used for | `JACKET_DOUBLE_PEAK`, flap-pocket reference, double-button front |
| Modifications | Scale/pose normalize to same reference mannequin; strip extras; rename; `FABRIC_MAIN` |

**Local path:** `assets/3d/donors/double-breasted-blazer/` or `assets/3d/donors/double-breasted-blazer.glb`

### 3. Classic suit — vest + trousers (matched proportions)

| Field | Value |
|---|---|
| Title | Classic suit |
| Author | Alex (@ansron55) |
| URL | https://sketchfab.com/3d-models/classic-suit-c01a4547bd8e45e9891ecf25c7c10457 |
| UID | `c01a4547bd8e45e9891ecf25c7c10457` |
| License | CC Attribution |
| Tris | ~121.8k |
| Used for | `VEST_SINGLE` (`Vest_Vest_0`), `TROUSERS_CLASSIC` (`Trousers_Trousers_0`) |
| Modifications | Extract named meshes; torso/bbox normalize; shared waist line; `FABRIC_MAIN` |

**Local path:** `assets/3d/donors/classic-suit.glb`

### 3b. A Fashionable Waistcoat — fallback vest only

| Field | Value |
|---|---|
| Title | A Fashionable Waistcoat |
| Author | Blamyris "W0rldbuilder" Cardona (@w0rldbuilder) |
| URL | https://sketchfab.com/3d-models/a-fashionable-waistcoat-2a270a2021df444b926fc68aa0ea2136 |
| UID | `2a270a2021df444b926fc68aa0ea2136` |
| License | CC Attribution |
| Used for | Fallback `VEST_SINGLE` if classic-suit donor missing |
| Path | `assets/3d/donors/fashionable-waistcoat.glb` |

---

## Optional / later donors

### 4. Classic suit — (promoted to phase 1 above)

Same UID `c01a4547bd8e45e9891ecf25c7c10457` — vest + trousers are now phase-1 required.

### 5. Business Suit — lightweight alternative

| Field | Value |
|---|---|
| Title | Business Suit |
| Author | slmesh |
| URL | https://sketchfab.com/3d-models/business-suit-54e90364aadb4c3999e2c7fbac87e920 |
| UID | `54e90364aadb4c3999e2c7fbac87e920` |
| License | CC Attribution |
| Tris | ~7.1k |
| Used for | Only if topology beats other donors for a part |
| Path | `assets/3d/donors/business-suit/` |

### 6. Clothing And Character Kit 1.0 — CC0 kit

| Field | Value |
|---|---|
| Title | Clothing And Character Kit 1.0 (CC0) |
| Author | britdawgmasterfunk |
| URL | https://sketchfab.com/3d-models/clothing-and-character-kit-10-cc0-7c733dceb2e04c4fb7e7dbd85316c1e7 |
| UID | `7c733dceb2e04c4fb7e7dbd85316c1e7` |
| License | Listed CC BY on Sketchfab; author states CC0 / also on BlendSwap |
| Tris | ~764k (kit) |
| Used for | Pants / vest parts if better topology |
| Path | `assets/3d/donors/clothing-kit-cc0/` |

---

## Not used as modular source

| Asset | Reason |
|---|---|
| Former `man_black_business_suit.glb` / `suit-web-v2.glb` | Monolithic Style3D / Sketchfab figure; unsuitable for garment switching |

---

## Manual download (required)

Sketchfab Download API returned **401 Unauthorized** without OAuth. Do not bypass. Download in the browser while logged into Sketchfab:

1. Open each **Phase 1** URL above.
2. Click **Download 3D Model** → prefer **glTF** (or GLB if offered).
3. Save into the matching `assets/3d/donors/...` path (unzip glTF archives so `scene.gltf` is inside the folder).
4. Run:

```bash
pnpm 3d:check-donors
pnpm 3d:build-modular
```

---

## Runtime credit

UI / docs must keep author + model links discoverable. This file is the source of truth for credit text.
