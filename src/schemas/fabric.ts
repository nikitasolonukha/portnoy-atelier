import { z } from "zod";

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : Number(value)),
  z.number().nonnegative("Значение не может быть отрицательным").optional(),
);

export const fabricInputSchema = z.object({
  article: z.string().trim().min(1, "Укажите артикул").max(80).transform((value) => value.toUpperCase()),
  name: z.string().trim().min(1, "Укажите название").max(160),
  manufacturer: z.string().trim().max(160).optional().default(""),
  collection: z.string().trim().max(160).optional().default(""),
  composition: z.string().trim().max(240).optional().default(""),
  mainColor: z.string().trim().max(80).optional().default(""),
  pattern: z.string().trim().max(80).optional().default(""),
  weightGsm: optionalNumber,
  widthCm: optionalNumber,
  pricePerMeter: optionalNumber,
  currency: z.enum(["RUB", "EUR", "USD"]).optional().default("RUB"),
  description: z.string().trim().max(2000).optional().default(""),
});

export const fabricPatchSchema = fabricInputSchema.partial();

export type FabricInput = z.input<typeof fabricInputSchema>;
export type FabricData = z.output<typeof fabricInputSchema>;
