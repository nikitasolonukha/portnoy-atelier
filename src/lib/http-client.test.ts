import { afterEach, describe, expect, it, vi } from "vitest";
import { requestAllPages } from "./http-client";

afterEach(() => vi.unstubAllGlobals());

describe("requestAllPages", () => {
  it("loads every bounded API page instead of stopping at the default limit", async () => {
    const records = Array.from({ length: 250 }, (_, index) => ({ id: `fabric-${index + 1}` }));
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input), "http://localhost");
      const page = Number(url.searchParams.get("page"));
      const limit = Number(url.searchParams.get("limit"));
      const start = (page - 1) * limit;
      const data = records.slice(start, start + limit);
      return new Response(JSON.stringify({ data, meta: { page, limit, total: records.length, hasMore: start + data.length < records.length } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await requestAllPages<{ id: string }>("/api/v1/fabrics?status=all", 200);

    expect(result).toHaveLength(250);
    expect(result.at(-1)?.id).toBe("fabric-250");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});