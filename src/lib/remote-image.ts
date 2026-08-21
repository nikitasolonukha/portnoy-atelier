import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { ApiProblem } from "@/lib/api-response";
import { detectImageMime, MAX_IMAGE_BYTES, safeUploadName } from "@/lib/image-upload";

const FETCH_TIMEOUT_MS = 15_000;
const MAX_REDIRECTS = 3;

export type RemoteImage = {
  bytes: Uint8Array;
  mimeType: string;
  filename: string;
};

export function isBlockedIpAddress(address: string): boolean {
  if (address.includes(":")) {
    const normalized = address.toLowerCase();
    if (normalized === "::1" || normalized === "::") return true;
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
    if (normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) return true;
    if (normalized.startsWith("::ffff:")) {
      const mapped = normalized.slice("::ffff:".length);
      return isIP(mapped) === 4 ? isBlockedIpAddress(mapped) : true;
    }
    return false;
  }

  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

async function assertPublicHostname(hostname: string) {
  const familyHint = isIP(hostname);
  if (familyHint === 4 || familyHint === 6) {
    if (isBlockedIpAddress(hostname)) {
      throw new ApiProblem("image_url_blocked", "URL фото указывает на закрытый адрес", 422);
    }
    return;
  }

  let records: Array<{ address: string }>;
  try {
    records = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new ApiProblem("image_url_unreachable", "Не удалось разрешить хост URL фото", 422);
  }
  if (!records.length || records.some((record) => isBlockedIpAddress(record.address))) {
    throw new ApiProblem("image_url_blocked", "URL фото указывает на закрытый адрес", 422);
  }
}

function assertHttpsUrl(raw: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new ApiProblem("image_url_invalid", "Некорректный URL фото", 422);
  }
  if (parsed.protocol !== "https:") {
    throw new ApiProblem("image_url_invalid", "Для импорта фото нужен публичный https URL", 422);
  }
  if (parsed.username || parsed.password) {
    throw new ApiProblem("image_url_blocked", "URL фото с учётными данными запрещён", 422);
  }
  return parsed;
}

function filenameFromUrl(url: URL, mimeType: string) {
  const leaf = decodeURIComponent(url.pathname.split("/").pop() || "").split("?")[0] || "import";
  const withExt = leaf.includes(".") ? leaf : `${leaf}.${mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg"}`;
  return safeUploadName(withExt);
}

export async function fetchRemoteImage(
  imageUrl: string,
  fetchImpl: typeof fetch = fetch,
): Promise<RemoteImage> {
  let current = assertHttpsUrl(imageUrl.trim());
  await assertPublicHostname(current.hostname);

  for (let redirect = 0; redirect <= MAX_REDIRECTS; redirect += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetchImpl(current, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: { Accept: "image/jpeg,image/png,image/webp,image/*;q=0.8,*/*;q=0.5" },
      });
    } catch (cause) {
      if (cause instanceof Error && cause.name === "AbortError") {
        throw new ApiProblem("image_url_timeout", "Превышено время ожидания загрузки фото", 422);
      }
      throw new ApiProblem("image_url_unreachable", "Не удалось скачать фото по URL", 422);
    } finally {
      clearTimeout(timer);
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new ApiProblem("image_url_unreachable", "Редирект фото без Location", 422);
      current = assertHttpsUrl(new URL(location, current).toString());
      await assertPublicHostname(current.hostname);
      continue;
    }

    if (!response.ok) {
      throw new ApiProblem("image_url_unreachable", "Не удалось скачать фото по URL", 422);
    }

    const contentLength = Number(response.headers.get("content-length") ?? "0");
    if (contentLength > MAX_IMAGE_BYTES) {
      throw new ApiProblem("image_size_invalid", "Размер изображения должен быть от 1 байта до 10 МБ", 413);
    }

    const buffer = new Uint8Array(await response.arrayBuffer());
    if (buffer.byteLength <= 0 || buffer.byteLength > MAX_IMAGE_BYTES) {
      throw new ApiProblem("image_size_invalid", "Размер изображения должен быть от 1 байта до 10 МБ", 413);
    }
    const mimeType = detectImageMime(buffer);
    if (!mimeType) {
      throw new ApiProblem("unsupported_image_type", "Допустимы только JPEG, PNG и WebP", 415);
    }

    return {
      bytes: buffer,
      mimeType,
      filename: filenameFromUrl(current, mimeType),
    };
  }

  throw new ApiProblem("image_url_unreachable", "Слишком много редиректов при загрузке фото", 422);
}
