import type { ApiErrorBody } from "./api-response";

export class HttpClientError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) { super(message); this.name = "HttpClientError"; }
}

type ApiEnvelope<T> = { data: T; meta?: unknown };

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

async function requestEnvelope<T>(input: RequestInfo | URL, init?: RequestInit): Promise<ApiEnvelope<T>> {
  const response = await fetch(input, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const body = await response.json().catch(() => null) as ApiEnvelope<T> | ApiErrorBody | null;
  if (!response.ok) {
    const error = body && "error" in body ? body.error : { code: "http_error", message: `HTTP ${response.status}` };
    throw new HttpClientError(response.status, error.code, error.message);
  }
  if (!body || !("data" in body)) throw new HttpClientError(502, "invalid_response", "Сервер вернул некорректный ответ");
  return body;
}

function parsePaginationMeta(value: unknown): PaginationMeta {
  if (!value || typeof value !== "object") throw new HttpClientError(502, "invalid_pagination", "Сервер вернул некорректную пагинацию");
  const meta = value as Record<string, unknown>;
  if (typeof meta.page !== "number" || !Number.isInteger(meta.page) || typeof meta.limit !== "number" || !Number.isInteger(meta.limit) || typeof meta.total !== "number" || !Number.isInteger(meta.total) || typeof meta.hasMore !== "boolean") {
    throw new HttpClientError(502, "invalid_pagination", "Сервер вернул некорректную пагинацию");
  }
  return { page: meta.page, limit: meta.limit, total: meta.total, hasMore: meta.hasMore };
}

export async function requestData<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  return (await requestEnvelope<T>(input, init)).data;
}

export async function requestAllPages<T>(input: string, pageSize = 200): Promise<T[]> {
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 200) throw new Error("Page size must be between 1 and 200");
  const separator = input.includes("?") ? "&" : "?";
  const items: T[] = [];
  let page = 1;
  while (true) {
    const envelope = await requestEnvelope<T[]>(`${input}${separator}page=${page}&limit=${pageSize}`);
    const meta = parsePaginationMeta(envelope.meta);
    if (meta.page !== page || meta.limit !== pageSize || meta.total < items.length + envelope.data.length) {
      throw new HttpClientError(502, "invalid_pagination", "Сервер вернул несогласованную пагинацию");
    }
    items.push(...envelope.data);
    if (!meta.hasMore) {
      if (items.length !== meta.total) throw new HttpClientError(502, "invalid_pagination", "Сервер вернул неполный каталог");
      return items;
    }
    if (envelope.data.length === 0) throw new HttpClientError(502, "invalid_pagination", "Сервер вернул пустую промежуточную страницу");
    page += 1;
  }
}
