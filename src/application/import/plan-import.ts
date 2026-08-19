import { fabricInputSchema, fabricPatchSchema } from "@/schemas/fabric";

export type DuplicateStrategy = "skip" | "update";

export function planFabricImport(rows: Record<string, unknown>[], existingArticles: Set<string>, strategy: DuplicateStrategy) {
  const create: Array<Record<string, unknown>> = [];
  const update: Array<Record<string, unknown>> = [];
  const invalid: Array<{ row: number; issues: string[] }> = [];
  const seen = new Set<string>();

  rows.forEach((row, index) => {
    const parsed = fabricInputSchema.safeParse(row);
    if (!parsed.success) {
      invalid.push({ row: index + 2, issues: [...new Set(parsed.error.issues.map((issue) => issue.message))] });
      return;
    }
    const article = parsed.data.article;
    if (seen.has(article)) {
      invalid.push({ row: index + 2, issues: ["Артикул повторяется в файле"] });
      return;
    }
    seen.add(article);
    if (existingArticles.has(article)) {
      if (strategy === "update") update.push(fabricPatchSchema.parse(row));
      // The skip strategy is a valid no-op, not a validation failure.
      return;
    }
    create.push(parsed.data);
  });

  return { create, update, invalid };
}
