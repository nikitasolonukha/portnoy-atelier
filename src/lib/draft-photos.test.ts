import { describe, expect, it } from "vitest";
import {
  appendDraftPhotos,
  draftPhotosFromAssets,
  makeDraftPhotoMain,
  MAX_FABRIC_PHOTOS,
  moveDraftPhoto,
  pendingDraftFiles,
  removeDraftPhoto,
  removedExistingPhotoIds,
  resolveFinalPhotoOrder,
} from "./draft-photos";
import type { FabricAsset } from "@/types/domain";

function photo(id: string, sortOrder: number, name = `${id}.png`): FabricAsset {
  return {
    id,
    type: "photo",
    originalFilename: name,
    mimeType: "image/png",
    sortOrder,
    url: `/api/v1/fabrics/f1/assets/${id}`,
  };
}

describe("draft photos", () => {
  it("builds ordered existing drafts and moves any entry to main", () => {
    const draft = draftPhotosFromAssets([photo("a", 1), photo("b", 0), photo("c", 2)]);
    expect(draft.map((item) => item.kind === "existing" && item.assetId)).toEqual(["b", "a", "c"]);
    const mainC = makeDraftPhotoMain(draft, draft[2]!.key);
    expect(mainC.map((item) => item.kind === "existing" && item.assetId)).toEqual(["c", "b", "a"]);
  });

  it("enforces a single max of 12 across existing and pending photos", () => {
    const filled = draftPhotosFromAssets(
      Array.from({ length: 10 }, (_, index) => photo(`e${index}`, index)),
    );
    const first = appendDraftPhotos(filled, [new File(["a"], "a.png"), new File(["b"], "b.png"), new File(["c"], "c.png")]);
    expect(first.photos).toHaveLength(MAX_FABRIC_PHOTOS);
    expect(first.rejected).toBe(1);
    expect(first.error).toMatch(/12/);
    const blocked = appendDraftPhotos(first.photos, [new File(["d"], "d.png")]);
    expect(blocked.photos).toHaveLength(12);
    expect(blocked.rejected).toBe(1);
  });

  it("resolves mixed draft order from upload response ids", () => {
    const seed = draftPhotosFromAssets([photo("a", 0), photo("d", 1)]);
    const withNew = appendDraftPhotos(seed, [new File(["c"], "photo-c.png"), new File(["b"], "photo-b.png")]).photos;
    const reordered = moveDraftPhoto(moveDraftPhoto(withNew, 2, 0), 3, 2);
    // expect conceptually: newC, existingA, newB, existingD — build explicitly
    const newC = withNew.find((item) => item.kind === "new" && item.file.name === "photo-c.png")!;
    const newB = withNew.find((item) => item.kind === "new" && item.file.name === "photo-b.png")!;
    const existingA = seed[0]!;
    const existingD = seed[1]!;
    const draft = [newC, existingA, newB, existingD];
    const uploaded = new Map([
      [(newC as { tempId: string }).tempId, "id-c"],
      [(newB as { tempId: string }).tempId, "id-b"],
    ]);
    expect(resolveFinalPhotoOrder(draft, uploaded)).toEqual(["id-c", "a", "id-b", "d"]);
    expect(pendingDraftFiles(draft).map((file) => file.name)).toEqual(["photo-c.png", "photo-b.png"]);
    expect(removedExistingPhotoIds(seed, removeDraftPhoto(seed, seed[0]!.key))).toEqual(["a"]);
    expect(reordered).toHaveLength(4);
  });
});
