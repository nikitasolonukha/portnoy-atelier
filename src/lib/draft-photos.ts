import type { FabricAsset } from "@/types/domain";

export const MAX_FABRIC_PHOTOS = 12;

export type DraftPhoto =
  | {
      kind: "existing";
      key: string;
      assetId: string;
      asset: FabricAsset;
    }
  | {
      kind: "new";
      key: string;
      tempId: string;
      file: File;
    };

export function draftPhotosFromAssets(assets: FabricAsset[]): DraftPhoto[] {
  return assets
    .filter((asset) => asset.type === "photo")
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((asset) => ({
      kind: "existing" as const,
      key: `existing:${asset.id}`,
      assetId: asset.id,
      asset,
    }));
}

export function createNewDraftPhotos(files: File[]): DraftPhoto[] {
  return files.map((file) => {
    const tempId = crypto.randomUUID();
    return {
      kind: "new" as const,
      key: `new:${tempId}`,
      tempId,
      file,
    };
  });
}

export function moveDraftPhoto(photos: DraftPhoto[], from: number, to: number): DraftPhoto[] {
  if (to < 0 || to >= photos.length || from === to) return photos;
  const next = [...photos];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item!);
  return next;
}

export function makeDraftPhotoMain(photos: DraftPhoto[], key: string): DraftPhoto[] {
  const index = photos.findIndex((photo) => photo.key === key);
  if (index <= 0) return photos;
  return moveDraftPhoto(photos, index, 0);
}

export function removeDraftPhoto(photos: DraftPhoto[], key: string): DraftPhoto[] {
  return photos.filter((photo) => photo.key !== key);
}

export function appendDraftPhotos(photos: DraftPhoto[], files: File[]): {
  photos: DraftPhoto[];
  rejected: number;
  error?: string;
} {
  const room = MAX_FABRIC_PHOTOS - photos.length;
  if (room <= 0) {
    return {
      photos,
      rejected: files.length,
      error: `Можно добавить не больше ${MAX_FABRIC_PHOTOS} фотографий.`,
    };
  }
  if (files.length > room) {
    return {
      photos: [...photos, ...createNewDraftPhotos(files.slice(0, room))],
      rejected: files.length - room,
      error: `Можно добавить не больше ${MAX_FABRIC_PHOTOS} фотографий.`,
    };
  }
  return { photos: [...photos, ...createNewDraftPhotos(files)], rejected: 0 };
}

export function removedExistingPhotoIds(seed: DraftPhoto[], current: DraftPhoto[]): string[] {
  const remaining = new Set(
    current.filter((photo): photo is Extract<DraftPhoto, { kind: "existing" }> => photo.kind === "existing")
      .map((photo) => photo.assetId),
  );
  return seed
    .filter((photo): photo is Extract<DraftPhoto, { kind: "existing" }> => photo.kind === "existing")
    .map((photo) => photo.assetId)
    .filter((id) => !remaining.has(id));
}

export function pendingDraftFiles(photos: DraftPhoto[]): File[] {
  return photos
    .filter((photo): photo is Extract<DraftPhoto, { kind: "new" }> => photo.kind === "new")
    .map((photo) => photo.file);
}

export function resolveFinalPhotoOrder(
  photos: DraftPhoto[],
  uploadedByTempId: Map<string, string>,
): string[] {
  return photos.map((photo) => {
    if (photo.kind === "existing") return photo.assetId;
    const createdId = uploadedByTempId.get(photo.tempId);
    if (!createdId) throw new Error("Не удалось сопоставить загруженные фотографии");
    return createdId;
  });
}
