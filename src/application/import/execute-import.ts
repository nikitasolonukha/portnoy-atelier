import type { FabricAssetWriter } from "@/application/ports/fabric-asset-writer";
import type { FabricRepository } from "@/application/ports/fabric-repository";
import { ApiProblem } from "@/lib/api-response";
import { fetchRemoteImage } from "@/lib/remote-image";
import { fabricInputSchema, fabricPatchSchema } from "@/schemas/fabric";

export type ImportRowError = { row: number; article?: string; message: string };
export type FabricImportResult = {
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  partial: boolean;
  errors: ImportRowError[];
};

export type FabricImportPhotoSupport = {
  assets: FabricAssetWriter;
  loadImage?: typeof fetchRemoteImage;
};

function errorMessage(cause: unknown) {
  if (cause instanceof ApiProblem) return cause.message;
  if (cause instanceof Error) return cause.message;
  return "Не удалось импортировать строку";
}

async function attachImportPhoto(
  fabricId: string,
  imageUrl: string | undefined,
  photos: FabricImportPhotoSupport | undefined,
) {
  if (!imageUrl?.trim() || !photos) return;
  const loadImage = photos.loadImage ?? fetchRemoteImage;
  const image = await loadImage(imageUrl);
  await photos.assets.attachPhoto(fabricId, {
    bytes: image.bytes,
    filename: image.filename,
    mimeType: image.mimeType,
  });
}

export async function executeFabricImport(
  rows: Record<string, unknown>[],
  strategy: "update" | "skip",
  repository: FabricRepository,
  actorId: string,
  photos?: FabricImportPhotoSupport,
): Promise<FabricImportResult> {
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
        const patch = fabricPatchSchema.parse(raw);
        const saved = await repository.update(existing.id, patch, actorId);
        if (!saved) throw new Error("Ткань не найдена во время обновления");
        await attachImportPhoto(saved.id, patch.imageUrl, photos);
        updated += 1;
      } else {
        const saved = await repository.create(parsed.data, actorId);
        try {
          await attachImportPhoto(saved.id, parsed.data.imageUrl, photos);
        } catch (photoError) {
          const removed = await repository.remove(saved.id);
          if (!removed) await repository.archive(saved.id, actorId);
          throw photoError;
        }
        created += 1;
      }
    } catch (cause) {
      failed += 1;
      errors.push({ row: index + 2, article, message: errorMessage(cause) });
    }
  }
  return { created, updated, skipped, failed, partial: failed > 0 && created + updated + skipped > 0, errors };
}
