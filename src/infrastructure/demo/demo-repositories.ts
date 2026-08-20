import type { ConfigurationCreate, ConfigurationRepository } from "@/application/ports/configuration-repository";
import type { FabricListQuery, FabricRepository } from "@/application/ports/fabric-repository";
import { filterFabrics } from "@/lib/catalog";
import { demoConfigurations, demoFabrics, demoGroups } from "@/lib/demo-data";
import { buildImportedFabric, photoAssetsFromUrl, swatchForColor } from "@/lib/fabric-from-import";
import type { FabricData } from "@/schemas/fabric";
import type { Fabric, SavedConfiguration } from "@/types/domain";

let fabrics = structuredClone(demoFabrics);
let configurations = structuredClone(demoConfigurations);

export function resetDemoData() {
  fabrics = structuredClone(demoFabrics);
  configurations = structuredClone(demoConfigurations);
}

export class DemoFabricRepository implements FabricRepository {
  async list(query: FabricListQuery = {}) { const matches = filterFabrics(fabrics, { query: query.query, status: query.status }); const limit = Math.min(query.limit ?? 100, 200); const from = ((query.page ?? 1) - 1) * limit; return { items: matches.slice(from, from + limit), total: matches.length }; }
  async findById(id: string) { return fabrics.find((item) => item.id === id) ?? null; }
  async findByArticle(article: string) { return fabrics.find((item) => item.article === article) ?? null; }
  async create(input: FabricData) {
    const fabric = buildImportedFabric(input);
    fabrics = [fabric, ...fabrics]; return fabric;
  }
  async update(id: string, input: Partial<FabricData>, _actorId?: string) {
    const current = fabrics.find((item) => item.id === id);
    if (!current) return null;
    const { imageUrl, ...rest } = input;
    const assets = photoAssetsFromUrl(imageUrl);
    Object.assign(current, rest, {
      ...(assets ? { assets, swatch: swatchForColor(input.mainColor || current.mainColor) } : {}),
      updatedAt: new Date().toISOString(),
    });
    return current;
  }
  async archive(id: string) { const current = fabrics.find((item) => item.id === id); if (!current) return false; current.isActive = false; return true; }
  async remove(id: string) { const size = fabrics.length; fabrics = fabrics.filter((item) => item.id !== id); if (size === fabrics.length) return false; configurations.forEach((item) => { if (item.fabricId === id) item.fabricId = null; }); return true; }
}

export class DemoConfigurationRepository implements ConfigurationRepository {
  async list() { return configurations; }
  async findById(id: string) { return configurations.find((item) => item.id === id) ?? null; }
  async create(input: ConfigurationCreate, actorId: string) { const now = new Date().toISOString(); const record: SavedConfiguration = { ...input, id: crypto.randomUUID(), createdBy: actorId, createdAt: now, updatedAt: now }; configurations = [record, ...configurations]; return record; }
  async update(id: string, input: Partial<ConfigurationCreate>) { const current = configurations.find((item) => item.id === id); if (!current) return null; Object.assign(current, input, { updatedAt: new Date().toISOString() }); return current; }
  async remove(id: string) { const size = configurations.length; configurations = configurations.filter((item) => item.id !== id); return size !== configurations.length; }
}

export async function loadDemoGroups() { return structuredClone(demoGroups); }
