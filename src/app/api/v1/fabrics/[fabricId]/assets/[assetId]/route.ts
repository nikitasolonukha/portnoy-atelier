import { NextRequest, NextResponse } from "next/server";
import { requireActor, requireRole } from "@/infrastructure/auth/actor";
import { toErrorResponse } from "@/interface/http/respond";
import { ApiProblem } from "@/lib/api-response";
import { getServerEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ fabricId: string; assetId: string }> };

async function getAsset(fabricId: string, assetId: string) {
  const client = await createClient();
  const { data, error } = await client.from("fabric_assets").select("*").eq("id", assetId).eq("fabric_id", fabricId).maybeSingle();
  if (error) throw new ApiProblem("asset_read_failed", "Не удалось загрузить изображение", 500);
  if (!data) throw new ApiProblem("asset_not_found", "Изображение не найдено", 404);
  return { client, asset: data };
}

export async function GET(_: NextRequest, context: Context) {
  try {
    await requireActor();
    if (getServerEnv().APP_MODE !== "supabase") throw new ApiProblem("persistent_storage_required", "Изображения доступны в режиме Supabase", 409);
    const { fabricId, assetId } = await context.params;
    const { client, asset } = await getAsset(fabricId, assetId);
    const { data, error } = await client.storage.from("fabric-assets").download(asset.storage_path);
    if (error || !data) throw new ApiProblem("asset_download_failed", "Не удалось загрузить изображение", 500);
    return new NextResponse(await data.arrayBuffer(), {
      headers: {
        "Content-Type": asset.mime_type,
        "Cache-Control": "private, max-age=300",
        "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(asset.original_filename)}`,
      },
    });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}

export async function DELETE(_: NextRequest, context: Context) {
  try {
    const actor = await requireActor();
    requireRole(actor, ["admin", "tailor"]);
    if (getServerEnv().APP_MODE !== "supabase") throw new ApiProblem("persistent_storage_required", "Изображения доступны в режиме Supabase", 409);
    const { fabricId, assetId } = await context.params;
    const { client, asset } = await getAsset(fabricId, assetId);
    const { error: metadataError } = await client.from("fabric_assets").delete().eq("id", asset.id);
    if (metadataError) throw new ApiProblem("asset_delete_failed", "Не удалось удалить изображение", 500);
    const { error: storageError } = await client.storage.from("fabric-assets").remove([asset.storage_path]);
    if (storageError) {
      await client.from("fabric_assets").insert(asset);
      throw new ApiProblem("asset_delete_failed", "Не удалось удалить изображение без потери данных", 500);
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const response = toErrorResponse(error);
    return NextResponse.json(response.body, { status: response.status });
  }
}
