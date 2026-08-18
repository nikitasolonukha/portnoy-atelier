import { z } from "zod";

export const fabricListQuerySchema = z.object({
  q: z.string().trim().max(160).optional().transform((value) => value || undefined),
  status: z.enum(["active", "archived", "all"]).optional().default("active"),
  limit: z.coerce.number().int().min(1).max(200).optional().default(100),
});
