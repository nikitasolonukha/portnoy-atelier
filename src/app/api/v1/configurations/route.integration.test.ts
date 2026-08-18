import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

const previous = process.env.APP_MODE;
beforeAll(() => { process.env.APP_MODE = "demo"; });
afterAll(() => { if (previous === undefined) delete process.env.APP_MODE; else process.env.APP_MODE = previous; });

describe("/api/v1/configurations integration", () => {
  it("persists a valid data-driven configuration", async () => {
    const response = await POST(new NextRequest("http://localhost/api/v1/configurations", { method: "POST", body: JSON.stringify({ name: "API configuration", fabricId: "f1", settings: { jacket: "single", lapel: "notch" } }) }));
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({ data: { name: "API configuration", settings: { jacket: "single", lapel: "notch" } } });
  });

  it("rejects an option from the wrong group", async () => {
    const response = await POST(new NextRequest("http://localhost/api/v1/configurations", { method: "POST", body: JSON.stringify({ name: "Invalid configuration", fabricId: "f1", settings: { jacket: "peak" } }) }));
    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({ error: { code: "configuration_option_invalid" } });
  });
});
