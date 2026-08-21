import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireActor, requireRole } from "@/infrastructure/auth/actor";
import { toErrorResponse } from "@/interface/http/respond";
import { ApiProblem, apiSuccess } from "@/lib/api-response";
import { getServerEnv } from "@/lib/env";
import { MAX_FABRIC_PHOTOS } from "@/lib/draft-photos";
import { safeUploadName, validateImageUpload } from "@/lib/image-upload";
import { createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ fabricId: string }> };
const assetTypeSchema = z.enum(["photo", "texture"]);
const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    sortOrder: z.number().int().min(0),
  })).min(1),
});

function mapReorderRpcError(error: { message?: string; code?: string }) {
  const message = error.message ?? "";
  if (message.includes("photo_order_conflict") || error.code === "P0001") {
    return new ApiProblem(
      "photo_order_conflict",
      "Состав фотографий изменился. Обновите страницу и повторите.",
      409,
    );
  }
  if (message.includes("photo_order_duplicate")) {
    return new ApiProblem("photo_order_invalid", "Порядок фотографий содержит повторяющиеся идентификаторы", 422);
  }
  if (message.includes("photo_order_type_invalid")) {
    return new ApiProblem("asset_type_invalid", "Менять порядок можно только у фотографий", 422);
  }
  if (message.includes("photo_order_forbidden") || error.code === "42501") {
    return new ApiProblem("forbidden", "Недостаточно прав", 403);
  }
  if (message.includes("photo_order_invalid")) {
    return new ApiProblem("photo_order_invalid", "Некорректный порядок фотографий", 422);
  }
  return new ApiProblem("asset_reorder_failed", "Не удалось сохранить порядок фотографий", 500);
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const actor = await requireActor();
    requireRole(actor, ["admin", "tailor"]);
    if (getServerEnv().APP_MODE !== "supabase") throw new ApiProblem("persistent_storage_required", "Управление изображениями доступно в режиме Supabase", 409);

    const { fabricId } = await context.params;
    const body = reorderSchema.parse(await request.json());
    const orderedIds = [...body.items]
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((item) => item.id);
    const sortOrders = body.items.map((item) => item.sortOrder).sort((left, right) => left - right);
    const expectedOrders = orderedIds.map((_, index) => index);
    if (sortOrders.join(",") !== expectedOrders.join(",")) {
      throw new ApiProblem("photo_order_invalid", "Порядок фотографий должен быть непрерывным с нуля", 422);
    }
    if (new Set(orderedIds).size !== orderedIds.length) {
      throw new ApiProblem("photo_order_invalid", "Порядок фотографий содержит повторяющиеся идентификаторы", 422);
    }

    const client = await createClient();
    const { data, error } = await client.rpc("reorder_fabric_photos", {
      p_fabric_id: fabricId,
      p_ordered_ids: orderedIds,
    });
    if (error) throw mapReorderRpcError(error);
    return NextResponse.json(apiSuccess(data ?? []));
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}

export async function POST(request: NextRequest, context: Context) {
  const uploadedPaths: string[] = [];
  const createdPaths: string[] = [];
  const createdMetadataIds: string[] = [];
  try {
    const actor = await requireActor();
    requireRole(actor, ["admin", "tailor"]);
    if (getServerEnv().APP_MODE !== "supabase") throw new ApiProblem("persistent_storage_required", "Загрузка изображений доступна в режиме Supabase", 409);

    const { fabricId } = await context.params;
    const body = await request.formData();
    const type = assetTypeSchema.parse(body.get("assetType") ?? "photo");
    const files = body.getAll("files").filter((entry): entry is File => entry instanceof File);
    const maxFiles = type === "texture" ? 1 : MAX_FABRIC_PHOTOS;
    if (!files.length || files.length > maxFiles) throw new ApiProblem("image_count_invalid", type === "texture" ? "Выберите одну текстуру" : `Выберите от 1 до ${MAX_FABRIC_PHOTOS} изображений`, 422);

    const client = await createClient();
    const { data: fabric, error: fabricError } = await client.from("fabrics").select("id").eq("id", fabricId).maybeSingle();
    if (fabricError) throw new ApiProblem("fabric_read_failed", "Не удалось проверить ткань", 500);
    if (!fabric) throw new ApiProblem("fabric_not_found", "Ткань не найдена", 404);

    const { count: photoCount } = await client.from("fabric_assets").select("id", { count: "exact", head: true }).eq("fabric_id", fabricId).eq("type", "photo");
    if (type === "photo" && (photoCount ?? 0) + files.length > MAX_FABRIC_PHOTOS) {
      throw new ApiProblem("image_count_invalid", `Можно добавить не больше ${MAX_FABRIC_PHOTOS} фотографий`, 422);
    }

    const assets = [];
    for (const [index, file] of files.entries()) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const mimeType = validateImageUpload(file, bytes.subarray(0, 16));
      const path = `${fabricId}/${type}/${crypto.randomUUID()}-${safeUploadName(file.name)}`;
      const { error: uploadError } = await client.storage.from("fabric-assets").upload(path, bytes, { contentType: mimeType, upsert: false });
      if (uploadError) throw new ApiProblem("asset_upload_failed", "Не удалось загрузить изображение", 500);
      uploadedPaths.push(path);

      if (type === "texture") {
        const { data: existing, error: existingError } = await client.from("fabric_assets").select("*").eq("fabric_id", fabricId).eq("type", "texture").maybeSingle();
        if (existingError) throw new ApiProblem("asset_read_failed", "Не удалось проверить текущую текстуру", 500);
        if (existing) {
          const { data, error: metadataError } = await client.from("fabric_assets").update({ storage_path: path, original_filename: file.name, mime_type: mimeType, sort_order: 0 }).eq("id", existing.id).select("*").single();
          if (metadataError || !data) throw new ApiProblem("asset_metadata_failed", "Не удалось заменить текстуру", 500);
          const { error: oldObjectError } = await client.storage.from("fabric-assets").remove([existing.storage_path]);
          if (oldObjectError) {
            await client.from("fabric_assets").update({ storage_path: existing.storage_path, original_filename: existing.original_filename, mime_type: existing.mime_type, sort_order: existing.sort_order }).eq("id", existing.id);
            throw new ApiProblem("asset_replace_failed", "Не удалось заменить текстуру без потери данных", 500);
          }
          uploadedPaths.splice(uploadedPaths.indexOf(path), 1);
          assets.push(data);
          continue;
        }
      }

      const { data, error: metadataError } = await client.from("fabric_assets").insert({
        fabric_id: fabricId,
        type,
        storage_path: path,
        original_filename: file.name,
        mime_type: mimeType,
        sort_order: type === "photo" ? (photoCount ?? 0) + index : 0,
      }).select("*").single();
      if (metadataError || !data) throw new ApiProblem("asset_metadata_failed", "Не удалось сохранить данные изображения", metadataError?.code === "23505" ? 409 : 500);
      createdMetadataIds.push(data.id);
      createdPaths.push(path);
      uploadedPaths.splice(uploadedPaths.indexOf(path), 1);
      assets.push(data);
    }
    return NextResponse.json(apiSuccess(assets, { count: assets.length }), { status: 201 });
  } catch (error) {
    try {
      const client = await createClient();
      if (createdMetadataIds.length) await client.from("fabric_assets").delete().in("id", createdMetadataIds);
      const cleanupPaths = [...uploadedPaths, ...createdPaths];
      if (cleanupPaths.length) await client.storage.from("fabric-assets").remove(cleanupPaths);
    } catch {
      // Original safe error is returned; cleanup is best-effort and never exposes internals.
    }
    const response = toErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
