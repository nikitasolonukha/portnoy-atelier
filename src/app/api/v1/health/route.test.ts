import { afterEach, describe, expect, it } from "vitest";
import { GET } from "./route";

const previousMode = process.env.APP_MODE;

afterEach(() => {
  if (previousMode === undefined) delete process.env.APP_MODE;
  else process.env.APP_MODE = previousMode;
});

describe("GET /api/v1/health", () => {
  it("reports liveness without requiring a database", async () => {
    process.env.APP_MODE = "demo";
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ data: { status: "ok", mode: "demo" } });
  });
});
