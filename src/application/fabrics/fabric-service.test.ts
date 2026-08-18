import { describe, expect, it } from "vitest";
import { ApiProblem } from "@/lib/api-response";
import { demoFabrics } from "@/lib/demo-data";
import type { FabricRepository } from "@/application/ports/fabric-repository";
import { FabricService } from "./fabric-service";

function fakeRepository(seed = demoFabrics.slice(0, 2)): FabricRepository {
  let records = structuredClone(seed);
  return {
    list: async () => records,
    findById: async (id) => records.find((item) => item.id === id) ?? null,
    findByArticle: async (article) => records.find((item) => item.article === article) ?? null,
    create: async (input, actorId) => {
      const now = new Date().toISOString();
      const record = { ...demoFabrics[0]!, ...input, id: `created-${actorId}`, createdAt: now, updatedAt: now };
      records.push(record);
      return record;
    },
    update: async (id, input) => {
      const current = records.find((item) => item.id === id);
      if (!current) return null;
      Object.assign(current, input);
      return current;
    },
    archive: async (id) => {
      const current = records.find((item) => item.id === id);
      if (!current) return false;
      current.isActive = false;
      return true;
    },
    remove: async (id) => {
      const size = records.length;
      records = records.filter((item) => item.id !== id);
      return records.length !== size;
    },
  };
}

describe("FabricService", () => {
  it("rejects a duplicate article with a stable conflict", async () => {
    const service = new FabricService(fakeRepository());
    await expect(service.create({ article: "VB-2401", name: "Duplicate" }, "u1")).rejects.toMatchObject({ code: "fabric_article_exists", status: 409 });
  });

  it("normalizes and creates a valid fabric", async () => {
    const service = new FabricService(fakeRepository());
    const created = await service.create({ article: "new-1", name: "New wool" }, "u1");
    expect(created.article).toBe("NEW-1");
  });

  it("returns not_found for archive of an unknown fabric", async () => {
    const service = new FabricService(fakeRepository());
    await expect(service.archive("missing")).rejects.toBeInstanceOf(ApiProblem);
  });
});
