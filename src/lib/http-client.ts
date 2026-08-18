import type { ApiErrorBody } from "./api-response";

export class HttpClientError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) { super(message); this.name = "HttpClientError"; }
}

export async function requestData<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const body = await response.json().catch(() => null) as { data?: T } | ApiErrorBody | null;
  if (!response.ok) {
    const error = body && "error" in body ? body.error : { code: "http_error", message: `HTTP ${response.status}` };
    throw new HttpClientError(response.status, error.code, error.message);
  }
  if (!body || !("data" in body)) throw new HttpClientError(502, "invalid_response", "Сервер вернул некорректный ответ");
  return body.data as T;
}
