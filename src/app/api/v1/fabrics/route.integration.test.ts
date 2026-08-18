import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "./route";

const previous = process.env.APP_MODE;
beforeAll(() => { process.env.APP_MODE = "demo"; });
afterAll(() => { if (previous === undefined) delete process.env.APP_MODE; else process.env.APP_MODE = previous; });

describe("/api/v1/fabrics integration", () => {
  it("creates and then lists a validated fabric", async () => {
    const article = `E2E-${Date.now()}`;
    const created = await POST(new NextRequest("http://localhost/api/v1/fabrics", { method: "POST", body: JSON.stringify({ article, name: "Integration wool" }) }));
    expect(created.status).toBe(201);
    expect(created.headers.get("location")).toMatch(/^\/api\/v1\/fabrics\//);
    const listed = await GET(new NextRequest(`http://localhost/api/v1/fabrics?q=${article}&status=all`));
    const body = await listed.json();
    expect(body.data).toHaveLength(1);
  });

  it("returns a field-level validation error", async () => {
    const response = await POST(new NextRequest("http://localhost/api/v1/fabrics", { method: "POST", body: JSON.stringify({ article: "", name: "" }) }));
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({ error: { code: "validation_error", details: expect.any(Array) } });
  });
});
