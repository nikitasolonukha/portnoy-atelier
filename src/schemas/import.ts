import { z } from "zod";

export const importRequestSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  strategy: z.enum(["update", "skip"]),
  rows: z.array(z.record(z.string(), z.unknown())).min(1).max(2000),
});

export type ImportRequest = z.output<typeof importRequestSchema>;
