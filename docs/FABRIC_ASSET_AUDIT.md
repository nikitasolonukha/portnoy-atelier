# Fabric Asset Audit

**Total active fabrics:** 6
**Real texture:** 0
**Procedural fallback:** 6
**Failed:** 0

| Article | Name | Source | Pattern | Texture applied? | Visual checked? |
|---|---|---|---|---|---|
| VB-2401 | Midnight Hopsack | procedural-fallback | Однотонная | Yes (Procedural) | Yes |
| LP-0772 | Prince of Wales Plaid | procedural-fallback | Клетка | Yes (Procedural) | Yes |
| Fox-012 | Charcoal Flannel | procedural-fallback | Однотонная | Yes (Procedural) | Yes |
| DR-991 | Solaro Olive | procedural-fallback | Однотонная | Yes (Procedural) | Yes |
| HL-550 | Coffee Chalk Stripe | procedural-fallback | Полоска | Yes (Procedural) | Yes |
| H&S-88 | Sand Tropical | procedural-fallback | Однотонная | Yes (Procedural) | Yes |

### Explanation:
The provided mock data in `atelier-data.ts` contains `previewUrl` links pointing to generic Unsplash photos (which contain perspective, lighting gradients, and folded fabric). These are **not suitable** for PBR material mapping. Additionally, there are no actual `assets` arrays with `type === "texture"` defined in the hardcoded mock database. 
Therefore, in strict compliance with the business rules, all fabrics currently fall back to the advanced procedural generator, which renders the exact patterns (check, stripe, twill, herringbone) using the correct `baseHex` as the foundation, resulting in a physically correct representation without perspective distortion.
