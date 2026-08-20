import { describe, expect, it, vi } from "vitest";

vi.mock("@/infrastructure/auth/actor", () => ({
  requireActor: vi.fn(async () => ({ id: "00000000-0000-0000-0000-000000000001", role: "admin" })),
  requireRole: vi.fn(),
}));

describe("PATCH /api/v1/fabrics/:id/assets in demo mode", () => {
  it("refuses to pretend photo order is persisted", async () => {
    const { PATCH } = await import("./route");
    const request = new Request("http://localhost/api/v1/fabrics/f1/assets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id: "00000000-0000-4000-8000-000000000001", sortOrder: 0 }] }),
    });
    const response = await PATCH(request as never, { params: Promise.resolve({ fabricId: "f1" }) });
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ error: { code: "persistent_storage_required" } });
  });
});
