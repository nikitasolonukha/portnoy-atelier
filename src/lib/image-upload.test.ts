import { describe, expect, it } from "vitest";
import { detectImageMime, safeUploadName, validateImageUpload } from "./image-upload";

describe("image upload validation", () => {
  it.each([
    [new Uint8Array([0xff, 0xd8, 0xff, 0x00]), "image/jpeg"],
    [new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "image/png"],
    [new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]), "image/webp"],
  ])("detects file signatures", (bytes, mime) => {
    expect(detectImageMime(bytes)).toBe(mime);
  });

  it("rejects an extension-only spoof", () => {
    expect(() => validateImageUpload({ name: "fabric.png", type: "image/png", size: 4 }, new Uint8Array([1, 2, 3, 4]))).toThrow("содержимому");
  });

  it("rejects oversized files", () => {
    expect(() => validateImageUpload({ name: "fabric.jpg", type: "image/jpeg", size: 10 * 1024 * 1024 + 1 }, new Uint8Array([0xff, 0xd8, 0xff]))).toThrow("10 МБ");
  });

  it("sanitizes the persisted filename", () => {
    expect(safeUploadName(" Моя ткань (1).JPG ")).toBe("1.jpg");
  });
});
