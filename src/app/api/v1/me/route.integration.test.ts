import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { GET } from "./route";

const previous = process.env.APP_MODE;
beforeAll(() => { process.env.APP_MODE = "demo"; });
afterAll(() => { if (previous === undefined) delete process.env.APP_MODE; else process.env.APP_MODE = previous; });

describe("GET /api/v1/me", () => {
  it("returns the authenticated actor contract", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: {
        id: "00000000-0000-0000-0000-000000000001",
        fullName: "Admin Demo",
        role: "admin",
      },
    });
  });
});
