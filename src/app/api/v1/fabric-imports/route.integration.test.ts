import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

const previous = process.env.APP_MODE;
beforeAll(() => { process.env.APP_MODE = "demo"; });
afterAll(() => { if (previous === undefined) delete process.env.APP_MODE; else process.env.APP_MODE = previous; });

describe("POST /api/v1/fabric-imports", () => {
  it("waits for all rows and returns real partial-success counts", async () => {
    const article = `IMPORT-${Date.now()}`;
    const response = await POST(new NextRequest("http://localhost/api/v1/fabric-imports", {
      method: "POST",
      body: JSON.stringify({
        filename: "fabrics.csv",
        strategy: "skip",
        rows: [
          { article, name: "Imported wool" },
          { article: "", name: "Invalid" },
        ],
      }),
    }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      data: { created: 1, updated: 0, skipped: 0, failed: 1, partial: true },
    });
  });
});
