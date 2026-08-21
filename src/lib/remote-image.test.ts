import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiProblem } from "@/lib/api-response";

vi.mock("node:dns/promises", () => ({
  lookup: vi.fn(async () => [{ address: "93.184.216.34", family: 4 }]),
}));

import { lookup } from "node:dns/promises";
import { fetchRemoteImage, isBlockedIpAddress } from "./remote-image";

const png = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
]);

describe("remote image SSRF guards", () => {
  beforeEach(() => {
    vi.mocked(lookup).mockResolvedValue([{ address: "93.184.216.34", family: 4 }] as never);
  });

  it("blocks private and link-local addresses", () => {
    expect(isBlockedIpAddress("127.0.0.1")).toBe(true);
    expect(isBlockedIpAddress("10.1.2.3")).toBe(true);
    expect(isBlockedIpAddress("172.16.5.5")).toBe(true);
    expect(isBlockedIpAddress("192.168.0.10")).toBe(true);
    expect(isBlockedIpAddress("169.254.1.1")).toBe(true);
    expect(isBlockedIpAddress("::1")).toBe(true);
    expect(isBlockedIpAddress("8.8.8.8")).toBe(false);
  });

  it("rejects non-https and literal private hosts before fetch", async () => {
    await expect(fetchRemoteImage("http://example.com/a.png")).rejects.toMatchObject({
      code: "image_url_invalid",
    } satisfies Partial<ApiProblem>);
    await expect(fetchRemoteImage("https://127.0.0.1/a.png")).rejects.toMatchObject({
      code: "image_url_blocked",
    });
  });

  it("downloads and validates image bytes from https", async () => {
    const fetchImpl = vi.fn(async () => new Response(png, {
      status: 200,
      headers: { "content-type": "image/png" },
    }));
    const image = await fetchRemoteImage("https://cdn.example.com/swatches/navy.png", fetchImpl);
    expect(image.mimeType).toBe("image/png");
    expect(image.filename).toBe("navy.png");
    expect(image.bytes).toEqual(png);
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("blocks hosts that resolve to private addresses", async () => {
    vi.mocked(lookup).mockResolvedValueOnce([{ address: "10.0.0.8", family: 4 }] as never);
    await expect(fetchRemoteImage("https://evil.example/a.png", vi.fn())).rejects.toMatchObject({
      code: "image_url_blocked",
    });
  });
});
