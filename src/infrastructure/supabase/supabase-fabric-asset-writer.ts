import type { SupabaseClient } from "@supabase/supabase-js";
import type { FabricAssetWriter, FabricPhotoUpload } from "@/application/ports/fabric-asset-writer";
import { ApiProblem } from "@/lib/api-response";
import { MAX_FABRIC_PHOTOS } from "@/lib/draft-photos";
import { safeUploadName } from "@/lib/image-upload";
import type { FabricAsset } from "@/types/domain";

export class SupabaseFabricAssetWriter implements FabricAssetWriter {
  constructor(private readonly client: SupabaseClient) {}

  async attachPhoto(fabricId: string, photo: FabricPhotoUpload): Promise<FabricAsset> {
    const { data: fabric, error: fabricError } = await this.client.from("fabrics").select("id").eq("id", fabricId).maybeSingle();
    if (fabricError) throw new ApiProblem("fabric_read_failed", "Не удалось проверить ткань", 500);
    if (!fabric) throw new ApiProblem("fabric_not_found", "Ткань не найдена", 404);

    const { count: photoCount, error: countError } = await this.client
      .from("fabric_assets")
      .select("id", { count: "exact", head: true })
      .eq("fabric_id", fabricId)
      .eq("type", "photo");
    if (countError) throw new ApiProblem("asset_read_failed", "Не удалось проверить фотографии ткани", 500);
    if ((photoCount ?? 0) >= MAX_FABRIC_PHOTOS) {
      throw new ApiProblem("image_count_invalid", `У ткани уже максимум ${MAX_FABRIC_PHOTOS} фотографий`, 422);
    }

    const path = `${fabricId}/photo/${crypto.randomUUID()}-${safeUploadName(photo.filename)}`;
    const { error: uploadError } = await this.client.storage
      .from("fabric-assets")
      .upload(path, photo.bytes, { contentType: photo.mimeType, upsert: false });
    if (uploadError) throw new ApiProblem("asset_upload_failed", "Не удалось загрузить изображение", 500);

    const { data, error: metadataError } = await this.client.from("fabric_assets").insert({
      fabric_id: fabricId,
      type: "photo",
      storage_path: path,
      original_filename: photo.filename,
      mime_type: photo.mimeType,
      sort_order: photoCount ?? 0,
    }).select("*").single();

    if (metadataError || !data) {
      await this.client.storage.from("fabric-assets").remove([path]);
      throw new ApiProblem("asset_metadata_failed", "Не удалось сохранить данные изображения", metadataError?.code === "23505" ? 409 : 500);
    }

    return {
      id: data.id,
      type: "photo",
      originalFilename: data.original_filename,
      mimeType: data.mime_type,
      sortOrder: data.sort_order,
      url: `/api/v1/fabrics/${fabricId}/assets/${data.id}`,
    };
  }
}
