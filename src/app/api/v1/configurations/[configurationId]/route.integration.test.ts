import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GET } from "./route";

const previous = process.env.APP_MODE;
beforeAll(() => { process.env.APP_MODE = "demo"; });
afterAll(() => { if (previous === undefined) delete process.env.APP_MODE; else process.env.APP_MODE = previous; });

describe("GET /api/v1/configurations/:configurationId", () => {
  it("returns a saved configuration by direct id", async () => {
    const response = await GET(new Request("http://localhost/api/v1/configurations/c1") as never, { params: Promise.resolve({ configurationId: "c1" }) });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ data: { id: "c1", name: "Городской синий" } });
  });

  it("returns a stable 404 for an unknown id", async () => {
    const response = await GET(new Request("http://localhost/api/v1/configurations/missing") as never, { params: Promise.resolve({ configurationId: "missing" }) });
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ error: { code: "configuration_not_found" } });
  });
});
