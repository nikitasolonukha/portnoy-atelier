import type { Fabric, FabricAsset } from "@/types/domain";

const colorSwatchMap: Record<string, string> = {
  синий: "navy-weave",
  голубой: "navy-weave",
  navy: "navy-weave",
  blue: "navy-weave",
  серый: "grey-check",
  графит: "charcoal",
  grey: "grey-check",
  gray: "grey-check",
  чёрный: "charcoal",
  черный: "charcoal",
  антрацит: "charcoal",
  black: "charcoal",
  коричневый: "brown-stripe",
  brown: "brown-stripe",
  бордовый: "brown-stripe",
  бордо: "brown-stripe",
  бежевый: "sand-weave",
  кремовый: "sand-weave",
  белый: "sand-weave",
  beige: "sand-weave",
  white: "sand-weave",
  оливковый: "olive-twill",
  зелёный: "olive-twill",
  зеленый: "olive-twill",
  olive: "olive-twill",
  green: "olive-twill",
};

export function swatchForColor(color?: string): string {
  if (!color) return "charcoal";
  return colorSwatchMap[color.toLocaleLowerCase("ru")] ?? "charcoal";
}

/** Prefer app-relative /fabrics/... so demo persist survives host/port changes. */
export function normalizeFabricImageUrl(imageUrl: string): string {
  const trimmed = imageUrl.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("/fabrics/")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith("/fabrics/")) return parsed.pathname;
  } catch {
    /* keep as-is */
  }
  return trimmed;
}

export function photoAssetsFromUrl(imageUrl?: string): FabricAsset[] | undefined {
  if (!imageUrl?.trim()) return undefined;
  const url = normalizeFabricImageUrl(imageUrl);
  const filename = url.split("/").pop()?.split("?")[0] || "import.jpg";
  const lower = filename.toLowerCase();
  const mimeType = lower.endsWith(".png")
    ? "image/png"
    : lower.endsWith(".webp")
      ? "image/webp"
      : "image/jpeg";
  return [
    {
      id: crypto.randomUUID(),
      type: "photo",
      originalFilename: filename,
      mimeType,
      sortOrder: 0,
      url,
    },
  ];
}

export function buildImportedFabric(
  data: {
    article: string;
    name: string;
    manufacturer?: string;
    collection?: string;
    composition?: string;
    mainColor?: string;
    pattern?: string;
    weightGsm?: number;
    widthCm?: number;
    pricePerMeter?: number;
    currency?: Fabric["currency"];
    description?: string;
    imageUrl?: string;
  },
  id = crypto.randomUUID(),
): Fabric {
  const now = new Date().toISOString();
  return {
    id,
    article: data.article,
    name: data.name,
    manufacturer: data.manufacturer || "",
    collection: data.collection || "",
    composition: data.composition || "",
    mainColor: data.mainColor || "",
    pattern: data.pattern || "",
    weightGsm: data.weightGsm ?? 0,
    widthCm: data.widthCm ?? 0,
    pricePerMeter: data.pricePerMeter ?? 0,
    currency: data.currency ?? "RUB",
    description: data.description || "",
    isActive: true,
    swatch: swatchForColor(data.mainColor),
    assets: photoAssetsFromUrl(data.imageUrl),
    createdAt: now,
    updatedAt: now,
  };
}
