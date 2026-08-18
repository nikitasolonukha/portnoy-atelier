import { describe, expect, it } from "vitest";
import { demoConfigurations, demoGroups } from "@/lib/demo-data";
import type { ConfigurationRepository } from "@/application/ports/configuration-repository";
import { ConfigurationService } from "./configuration-service";

function fakeRepository(): ConfigurationRepository {
  const records = structuredClone(demoConfigurations);
  return {
    list: async () => records,
    findById: async (id) => records.find((item) => item.id === id) ?? null,
    create: async (input, actorId) => ({ ...input, id: `new-${actorId}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
    update: async () => null,
    remove: async () => false,
  };
}

describe("ConfigurationService", () => {
  it("removes settings for groups that are not active", async () => {
    const service = new ConfigurationService(fakeRepository(), async () => demoGroups);
    const created = await service.create({ name: "Test", fabricId: "f1", settings: { jacket: "single", unknown: "x" } }, "u1");
    expect(created.settings).toEqual({ jacket: "single" });
  });

  it("rejects an option that does not belong to its group", async () => {
    const service = new ConfigurationService(fakeRepository(), async () => demoGroups);
    await expect(service.create({ name: "Test", fabricId: "f1", settings: { jacket: "peak" } }, "u1")).rejects.toMatchObject({ code: "configuration_option_invalid", status: 422 });
  });
});
