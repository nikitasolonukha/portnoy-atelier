import type { FabricAsset } from "@/types/domain";

export type FabricPhotoUpload = {
  bytes: Uint8Array;
  filename: string;
  mimeType: string;
};

export type FabricAssetWriter = {
  attachPhoto(fabricId: string, photo: FabricPhotoUpload): Promise<FabricAsset>;
};
