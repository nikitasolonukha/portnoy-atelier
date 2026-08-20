import { z } from "zod";

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === undefined ? undefined : Number(value)),
  z.number().nonnegative("Значение не может быть отрицательным").optional(),
);

const fields = {
  article: z.string().trim().min(1, "Укажите артикул").max(80).transform((value) => value.toUpperCase()),
  name: z.string().trim().min(1, "Укажите название").max(160),
  manufacturer: z.string().trim().max(160),
  collection: z.string().trim().max(160),
  composition: z.string().trim().max(240),
  mainColor: z.string().trim().max(80),
  pattern: z.string().trim().max(80),
  weightGsm: optionalNumber,
  widthCm: optionalNumber,
  pricePerMeter: optionalNumber,
  currency: z.enum(["RUB", "EUR", "USD"]),
  description: z.string().trim().max(2000),
};

export const fabricInputSchema = z.object({
  article: fields.article,
  name: fields.name,
  manufacturer: fields.manufacturer.optional().default(""),
  collection: fields.collection.optional().default(""),
  composition: fields.composition.optional().default(""),
  mainColor: fields.mainColor.optional().default(""),
  pattern: fields.pattern.optional().default(""),
  weightGsm: fields.weightGsm,
  widthCm: fields.widthCm,
  pricePerMeter: fields.pricePerMeter,
  currency: fields.currency.optional().default("RUB"),
  description: fields.description.optional().default(""),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || value.startsWith("/") || z.string().url().safeParse(value).success,
      "Укажите URL фото или путь /fabrics/...",
    ),
});

export const fabricPatchSchema = z.object({
  article: fields.article.optional(),
  name: fields.name.optional(),
  manufacturer: fields.manufacturer.optional(),
  collection: fields.collection.optional(),
  composition: fields.composition.optional(),
  mainColor: fields.mainColor.optional(),
  pattern: fields.pattern.optional(),
  weightGsm: fields.weightGsm,
  widthCm: fields.widthCm,
  pricePerMeter: fields.pricePerMeter,
  currency: fields.currency.optional(),
  description: fields.description.optional(),
  isActive: z.boolean().optional(),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || value.startsWith("/") || z.string().url().safeParse(value).success,
      "Укажите URL фото или путь /fabrics/...",
    ),
});

export type FabricInput = z.input<typeof fabricInputSchema>;
export type FabricData = z.output<typeof fabricInputSchema>;
export type FabricPatchData = z.output<typeof fabricPatchSchema>;
