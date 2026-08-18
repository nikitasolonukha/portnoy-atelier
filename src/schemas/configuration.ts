import { z } from "zod";

export const configurationInputSchema = z.object({
  name: z.string().trim().min(2, "Название должно содержать минимум 2 символа").max(120),
  fabricId: z.string().min(1, "Выберите ткань"),
  settings: z.record(z.string(), z.string().min(1)),
});
