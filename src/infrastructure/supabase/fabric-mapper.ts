import type { FabricData } from "@/schemas/fabric";
import type { Fabric } from "@/types/domain";
import type { FabricInsert, FabricRow } from "./database.types";

function currency(value: string | null): Fabric["currency"] {
  return value === "EUR" || value === "USD" ? value : "RUB";
}

export function mapFabricRow(row: FabricRow): Fabric {
  return {
    id: row.id,
    article: row.article,
    name: row.name,
    manufacturer: row.manufacturer ?? "",
    collection: row.collection ?? "",
    composition: row.composition ?? "",
    mainColor: row.main_color ?? "",
    pattern: row.pattern ?? "",
    weightGsm: row.weight_gsm ?? 0,
    widthCm: row.width_cm ?? 0,
    pricePerMeter: row.price_per_meter ?? 0,
    currency: currency(row.currency),
    description: row.description ?? "",
    isActive: row.is_active,
    swatch: "charcoal",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapFabricInsert(input: FabricData, actorId: string): FabricInsert {
  return {
    article: input.article,
    name: input.name,
    manufacturer: input.manufacturer || null,
    collection: input.collection || null,
    composition: input.composition || null,
    main_color: input.mainColor || null,
    pattern: input.pattern || null,
    weight_gsm: input.weightGsm ?? null,
    width_cm: input.widthCm ?? null,
    price_per_meter: input.pricePerMeter ?? null,
    currency: input.currency ?? "RUB",
    description: input.description || null,
    created_by: actorId,
    updated_by: actorId,
  };
}
