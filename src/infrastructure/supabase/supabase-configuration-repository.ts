import type { SupabaseClient } from "@supabase/supabase-js";
import type { ConfigurationCreate, ConfigurationRepository } from "@/application/ports/configuration-repository";
import { ApiProblem } from "@/lib/api-response";
import type { ConfigurationGroup, SavedConfiguration } from "@/types/domain";
import type { ConfigurationGroupRow, ConfigurationRow } from "./configuration-types";

function mapConfiguration(row: ConfigurationRow): SavedConfiguration {
  return { id: row.id, name: row.name, fabricId: row.fabric_id, settings: row.settings, createdBy: row.created_by, createdAt: row.created_at, updatedAt: row.updated_at };
}

export class SupabaseConfigurationRepository implements ConfigurationRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list() {
    const { data, error } = await this.client.from("configurations").select("*").order("updated_at", { ascending: false });
    if (error) throw new ApiProblem("configuration_list_failed", "Не удалось загрузить конфигурации", 500);
    return ((data ?? []) as unknown as ConfigurationRow[]).map(mapConfiguration);
  }

  async findById(id: string) {
    const { data, error } = await this.client.from("configurations").select("*").eq("id", id).maybeSingle();
    if (error) throw new ApiProblem("configuration_read_failed", "Не удалось загрузить конфигурацию", 500);
    return data ? mapConfiguration(data as unknown as ConfigurationRow) : null;
  }

  async create(input: ConfigurationCreate, actorId: string) {
    const { data, error } = await this.client.from("configurations").insert({ name: input.name, fabric_id: input.fabricId, settings: input.settings, created_by: actorId }).select("*").single();
    if (error || !data) throw new ApiProblem("configuration_create_failed", "Не удалось сохранить конфигурацию", 500);
    return mapConfiguration(data as unknown as ConfigurationRow);
  }

  async update(id: string, input: Partial<ConfigurationCreate>) {
    const patch = Object.fromEntries(Object.entries({ name: input.name, fabric_id: input.fabricId, settings: input.settings }).filter(([, value]) => value !== undefined));
    const { data, error } = await this.client.from("configurations").update(patch).eq("id", id).select("*").maybeSingle();
    if (error) throw new ApiProblem("configuration_update_failed", "Не удалось обновить конфигурацию", 500);
    return data ? mapConfiguration(data as unknown as ConfigurationRow) : null;
  }

  async remove(id: string) {
    const { error, count } = await this.client.from("configurations").delete({ count: "exact" }).eq("id", id);
    if (error) throw new ApiProblem("configuration_delete_failed", "Не удалось удалить конфигурацию", 500);
    return Boolean(count);
  }
}

export function filterAndMapActiveConfigurationGroups(rows: ConfigurationGroupRow[]): ConfigurationGroup[] {
  return rows.filter((row) => row.is_active).map((row) => ({
    id: row.id, key: row.key, name: row.name, sortOrder: row.sort_order, isActive: true,
    options: row.configuration_options.filter((option) => option.is_active).sort((a, b) => a.sort_order - b.sort_order).map((option) => ({ id: option.id, groupKey: row.key, key: option.key, name: option.name, description: option.description ?? undefined, sortOrder: option.sort_order, isActive: true })),
  }));
}

export async function loadConfigurationGroups(client: SupabaseClient): Promise<ConfigurationGroup[]> {
  const { data, error } = await client.from("configuration_groups").select("*,configuration_options(*)").eq("is_active", true).eq("configuration_options.is_active", true).order("sort_order");
  if (error) throw new ApiProblem("configuration_groups_failed", "Не удалось загрузить опции конфигуратора", 500);
  return filterAndMapActiveConfigurationGroups((data ?? []) as unknown as ConfigurationGroupRow[]);
}
