type LogLevel = "info" | "warn" | "error";

const redactedKeys = /password|token|secret|authorization|cookie/i;

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, redactedKeys.test(key) ? "[REDACTED]" : sanitize(entry)]));
  return value;
}

export function log(level: LogLevel, event: string, context: Record<string, unknown> = {}) {
  const payload = JSON.stringify({ level, event, timestamp: new Date().toISOString(), ...sanitize(context) as Record<string, unknown> });
  if (level === "error") console.error(payload);
  else if (level === "warn") console.warn(payload);
  else console.info(payload);
}
