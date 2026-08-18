import type { SupabaseClient } from "@supabase/supabase-js";
import type { FabricListQuery, FabricRepository } from "@/application/ports/fabric-repository";
import { ApiProblem } from "@/lib/api-response";
import type { FabricData, FabricPatchData } from "@/schemas/fabric";
import { mapFabricInsert, mapFabricRow } from "./fabric-mapper";
import type { FabricRow } from "./database.types";

const fabricSelection = "*,fabric_assets(*)";

export class SupabaseFabricRepository implements FabricRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(query: FabricListQuery = {}) {
    let request = this.client.from("fabrics").select(fabricSelection).order("updated_at", { ascending: false }).limit(Math.min(query.limit ?? 100, 200));
    if (query.status === "active" || !query.status) request = request.eq("is_active", true);
    if (query.status === "archived") request = request.eq("is_active", false);
    if (query.query) request = request.or(`article.ilike.%${query.query}%,name.ilike.%${query.query}%,manufacturer.ilike.%${query.query}%`);
    if (query.cursor) request = request.lt("updated_at", query.cursor);
    const { data, error } = await request;
    if (error) throw new ApiProblem("fabric_list_failed", "Не удалось загрузить ткани", 500);
    return ((data ?? []) as unknown as FabricRow[]).map(mapFabricRow);
  }

  async findById(id: string) {
    const { data, error } = await this.client.from("fabrics").select(fabricSelection).eq("id", id).maybeSingle();
    if (error) throw new ApiProblem("fabric_read_failed", "Не удалось загрузить ткань", 500);
    return data ? mapFabricRow(data as unknown as FabricRow) : null;
  }

  async findByArticle(article: string) {
    const { data, error } = await this.client.from("fabrics").select(fabricSelection).ilike("article", article).maybeSingle();
    if (error) throw new ApiProblem("fabric_read_failed", "Не удалось проверить артикул", 500);
    return data ? mapFabricRow(data as unknown as FabricRow) : null;
  }

  async create(input: FabricData, actorId: string) {
    const { data, error } = await this.client.from("fabrics").insert(mapFabricInsert(input, actorId)).select(fabricSelection).single();
    if (error?.code === "23505") throw new ApiProblem("fabric_article_exists", "Ткань с таким артикулом уже существует", 409);
    if (error || !data) throw new ApiProblem("fabric_create_failed", "Не удалось создать ткань", 500);
    return mapFabricRow(data as unknown as FabricRow);
  }

  async update(id: string, input: FabricPatchData, actorId: string) {
    const patch = Object.fromEntries(Object.entries({
      article: input.article,
      name: input.name,
      manufacturer: input.manufacturer,
      collection: input.collection,
      composition: input.composition,
      main_color: input.mainColor,
      pattern: input.pattern,
      weight_gsm: input.weightGsm,
      width_cm: input.widthCm,
      price_per_meter: input.pricePerMeter,
      currency: input.currency,
      description: input.description,
      is_active: input.isActive,
      updated_by: actorId,
    }).filter(([, value]) => value !== undefined));
    const { data, error } = await this.client.from("fabrics").update(patch).eq("id", id).select(fabricSelection).maybeSingle();
    if (error?.code === "23505") throw new ApiProblem("fabric_article_exists", "Ткань с таким артикулом уже существует", 409);
    if (error) throw new ApiProblem("fabric_update_failed", "Не удалось обновить ткань", 500);
    return data ? mapFabricRow(data as unknown as FabricRow) : null;
  }

  async archive(id: string, actorId?: string) {
    const { data, error } = await this.client.from("fabrics").update({ is_active: false, updated_by: actorId }).eq("id", id).select("id").maybeSingle();
    if (error) throw new ApiProblem("fabric_archive_failed", "Не удалось архивировать ткань", 500);
    return Boolean(data);
  }

  async remove(id: string) {
    const { error, count } = await this.client.from("fabrics").delete({ count: "exact" }).eq("id", id);
    if (error?.code === "23503") throw new ApiProblem("fabric_in_use", "Ткань используется в конфигурации", 409);
    if (error) throw new ApiProblem("fabric_delete_failed", "Не удалось удалить ткань", 500);
    return Boolean(count);
  }
}
