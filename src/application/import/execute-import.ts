import type { FabricRepository } from "@/application/ports/fabric-repository";
import { fabricInputSchema } from "@/schemas/fabric";

export type ImportRowError = { row: number; article?: string; message: string };
export type FabricImportResult = {
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  partial: boolean;
  errors: ImportRowError[];
};

export async function executeFabricImport(rows: Record<string, unknown>[], strategy: "update" | "skip", repository: FabricRepository, actorId: string): Promise<FabricImportResult> {
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;
  const errors: ImportRowError[] = [];
  const seen = new Set<string>();

  for (const [index, raw] of rows.entries()) {
    const parsed = fabricInputSchema.safeParse(raw);
    if (!parsed.success) {
      failed += 1;
      errors.push({ row: index + 2, article: typeof raw.article === "string" ? raw.article : undefined, message: [...new Set(parsed.error.issues.map((issue) => issue.message))].join(", ") });
      continue;
    }
    const article = parsed.data.article;
    if (seen.has(article)) {
      failed += 1;
      errors.push({ row: index + 2, article, message: "Артикул повторяется в файле" });
      continue;
    }
    seen.add(article);
    try {
      const existing = await repository.findByArticle(article);
      if (existing && strategy === "skip") {
        skipped += 1;
        continue;
      }
      if (existing) {
        const saved = await repository.update(existing.id, parsed.data, actorId);
        if (!saved) throw new Error("Ткань не найдена во время обновления");
        updated += 1;
      } else {
        await repository.create(parsed.data, actorId);
        created += 1;
      }
    } catch (cause) {
      failed += 1;
      errors.push({ row: index + 2, article, message: cause instanceof Error ? cause.message : "Не удалось импортировать строку" });
    }
  }
  return { created, updated, skipped, failed, partial: failed > 0 && created + updated + skipped > 0, errors };
}
