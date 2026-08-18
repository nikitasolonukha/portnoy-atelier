import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireActor, requireRole } from "@/infrastructure/auth/actor";
import { toErrorResponse } from "@/interface/http/respond";
import { ApiProblem, apiSuccess } from "@/lib/api-response";
import { getServerEnv } from "@/lib/env";
import { safeUploadName, validateImageUpload } from "@/lib/image-upload";
import { createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ fabricId: string }> };
const assetTypeSchema = z.enum(["photo", "texture"]);

export async function POST(request: NextRequest, context: Context) {
  try {
    const actor = await requireActor();
    requireRole(actor, ["admin", "tailor"]);
    if (getServerEnv().APP_MODE !== "supabase") throw new ApiProblem("persistent_storage_required", "Загрузка изображений доступна в режиме Supabase", 409);

    const { fabricId } = await context.params;
    const body = await request.formData();
    const type = assetTypeSchema.parse(body.get("assetType") ?? "photo");
    const files = body.getAll("files").filter((entry): entry is File => entry instanceof File);
    if (!files.length || files.length > 12) throw new ApiProblem("image_count_invalid", "Выберите от 1 до 12 изображений", 422);

    const client = await createClient();
    const { data: fabric, error: fabricError } = await client.from("fabrics").select("id").eq("id", fabricId).maybeSingle();
    if (fabricError) throw new ApiProblem("fabric_read_failed", "Не удалось проверить ткань", 500);
    if (!fabric) throw new ApiProblem("fabric_not_found", "Ткань не найдена", 404);

    const assets = [];
    for (const [index, file] of files.entries()) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const mimeType = validateImageUpload(file, bytes.subarray(0, 16));
      const path = `${fabricId}/${crypto.randomUUID()}-${safeUploadName(file.name)}`;
      const { error: uploadError } = await client.storage.from("fabric-assets").upload(path, bytes, { contentType: mimeType, upsert: false });
      if (uploadError) throw new ApiProblem("asset_upload_failed", "Не удалось загрузить изображение", 500);
      const { data, error: metadataError } = await client.from("fabric_assets").insert({ fabric_id: fabricId, type, storage_path: path, original_filename: file.name, mime_type: mimeType, sort_order: index }).select("*").single();
      if (metadataError || !data) {
        await client.storage.from("fabric-assets").remove([path]);
        throw new ApiProblem("asset_metadata_failed", "Не удалось сохранить данные изображения", 500);
      }
      assets.push(data);
    }
    return NextResponse.json(apiSuccess(assets, { count: assets.length }), { status: 201 });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
