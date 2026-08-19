import type { ConfigurationCreate, ConfigurationRepository } from "@/application/ports/configuration-repository";
import type { FabricListQuery, FabricRepository } from "@/application/ports/fabric-repository";
import { filterFabrics } from "@/lib/catalog";
import { demoConfigurations, demoFabrics, demoGroups } from "@/lib/demo-data";
import type { FabricData } from "@/schemas/fabric";
import type { Fabric, SavedConfiguration } from "@/types/domain";

let fabrics = structuredClone(demoFabrics);
let configurations = structuredClone(demoConfigurations);

export class DemoFabricRepository implements FabricRepository {
  async list(query: FabricListQuery = {}) { const matches = filterFabrics(fabrics, { query: query.query, status: query.status }); const limit = Math.min(query.limit ?? 100, 200); const from = ((query.page ?? 1) - 1) * limit; return { items: matches.slice(from, from + limit), total: matches.length }; }
  async findById(id: string) { return fabrics.find((item) => item.id === id) ?? null; }
  async findByArticle(article: string) { return fabrics.find((item) => item.article === article) ?? null; }
  async create(input: FabricData) {
    const now = new Date().toISOString();
    const fabric: Fabric = { id: crypto.randomUUID(), article: input.article, name: input.name, manufacturer: input.manufacturer || "", collection: input.collection || "", composition: input.composition || "", mainColor: input.mainColor || "", pattern: input.pattern || "", weightGsm: input.weightGsm ?? 0, widthCm: input.widthCm ?? 0, pricePerMeter: input.pricePerMeter ?? 0, currency: input.currency ?? "RUB", description: input.description || "", isActive: true, swatch: "charcoal", createdAt: now, updatedAt: now };
    fabrics = [fabric, ...fabrics]; return fabric;
  }
  async update(id: string, input: Partial<FabricData>) { const current = fabrics.find((item) => item.id === id); if (!current) return null; Object.assign(current, input, { updatedAt: new Date().toISOString() }); return current; }
  async archive(id: string) { const current = fabrics.find((item) => item.id === id); if (!current) return false; current.isActive = false; return true; }
  async remove(id: string) { if (configurations.some((item) => item.fabricId === id)) return false; const size = fabrics.length; fabrics = fabrics.filter((item) => item.id !== id); return size !== fabrics.length; }
}

export class DemoConfigurationRepository implements ConfigurationRepository {
  async list() { return configurations; }
  async findById(id: string) { return configurations.find((item) => item.id === id) ?? null; }
  async create(input: ConfigurationCreate) { const now = new Date().toISOString(); const record: SavedConfiguration = { ...input, id: crypto.randomUUID(), createdAt: now, updatedAt: now }; configurations = [record, ...configurations]; return record; }
  async update(id: string, input: Partial<ConfigurationCreate>) { const current = configurations.find((item) => item.id === id); if (!current) return null; Object.assign(current, input, { updatedAt: new Date().toISOString() }); return current; }
  async remove(id: string) { const size = configurations.length; configurations = configurations.filter((item) => item.id !== id); return size !== configurations.length; }
}

export async function loadDemoGroups() { return structuredClone(demoGroups); }
