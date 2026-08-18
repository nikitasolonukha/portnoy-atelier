export function normalizeConfiguration(settings: Record<string, string>, activeGroupKeys: string[]) {
  const allowed = new Set(activeGroupKeys);
  return Object.fromEntries(Object.entries(settings).filter(([key, value]) => allowed.has(key) && Boolean(value)));
}

export function diffConfigurations(left: Record<string, string>, right: Record<string, string>) {
  const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
  return keys.flatMap((key) => left[key] === right[key] ? [] : [{ key, left: left[key] ?? null, right: right[key] ?? null }]);
}
