import { describe, expect, it, vi } from "vitest";

vi.mock("@/infrastructure/auth/actor", () => ({
  requireActor: vi.fn(async () => ({ id: "00000000-0000-0000-0000-000000000001", role: "admin" })),
  requireRole: vi.fn(),
}));

describe("POST /api/v1/fabrics/:id/assets in demo mode", () => {
  it("refuses to pretend that files are persisted", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/v1/fabrics/f1/assets", { method: "POST", body: new FormData() });
    const response = await POST(request as never, { params: Promise.resolve({ fabricId: "f1" }) });
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ error: { code: "persistent_storage_required" } });
  });
});
