import { ApiProblem } from "./api-response";

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

export function detectImageMime(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value)) return "image/png";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

export function safeUploadName(name: string) {
  const extension = name.trim().split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const stem = name.trim().replace(/\.[^.]+$/, "").normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
  return `${stem || "image"}.${extension}`;
}

export function validateImageUpload(file: { name: string; type: string; size: number }, bytes: Uint8Array) {
  if (!allowed.has(file.type)) throw new ApiProblem("unsupported_image_type", "Допустимы только JPEG, PNG и WebP", 415);
  if (file.size <= 0 || file.size > MAX_IMAGE_BYTES) throw new ApiProblem("image_size_invalid", "Размер изображения должен быть от 1 байта до 10 МБ", 413);
  const detected = detectImageMime(bytes);
  if (!detected || detected !== file.type) throw new ApiProblem("image_signature_mismatch", "Тип изображения не соответствует его содержимому", 422);
  return detected;
}
