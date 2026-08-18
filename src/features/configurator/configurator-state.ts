import type { SavedConfiguration } from "@/types/domain";

export type ConfiguratorStatus = "loading" | "clean" | "dirty" | "saving" | "error";
type Snapshot = { name: string; fabricId: string; settings: Record<string, string> };

export type ConfiguratorDraft = Snapshot & {
  id: string | null;
  createdAt: string | null;
  status: ConfiguratorStatus;
  error: string | null;
  baseline: Snapshot;
};

function snapshot(input: Snapshot): Snapshot {
  return { name: input.name, fabricId: input.fabricId, settings: { ...input.settings } };
}

function sameRecord(left: Record<string, string>, right: Record<string, string>) {
  const keys = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
  return keys.every((key) => left[key] === right[key]);
}

export function createConfiguratorDraft(source: SavedConfiguration | null, defaultFabricId: string, defaultSettings: Record<string, string>): ConfiguratorDraft {
  const current = source
    ? { name: source.name, fabricId: source.fabricId ?? "", settings: { ...source.settings } }
    : { name: "Новая конфигурация", fabricId: defaultFabricId, settings: { ...defaultSettings } };
  return { ...current, id: source?.id ?? null, createdAt: source?.createdAt ?? null, status: "clean", error: null, baseline: snapshot(current) };
}

export function isConfiguratorDirty(state: ConfiguratorDraft) {
  return state.name !== state.baseline.name || state.fabricId !== state.baseline.fabricId || !sameRecord(state.settings, state.baseline.settings);
}

export function withConfiguratorEdit(state: ConfiguratorDraft, patch: Partial<Snapshot>): ConfiguratorDraft {
  const next = { ...state, ...patch, settings: patch.settings ? { ...patch.settings } : state.settings, error: null };
  return { ...next, status: isConfiguratorDirty(next) ? "dirty" : "clean" };
}

export function resetConfiguratorDraft(state: ConfiguratorDraft): ConfiguratorDraft {
  return { ...state, ...snapshot(state.baseline), status: "clean", error: null };
}

export function markConfiguratorSaved(state: ConfiguratorDraft, saved: SavedConfiguration): ConfiguratorDraft {
  const current = { name: saved.name, fabricId: saved.fabricId ?? "", settings: { ...saved.settings } };
  return { ...state, ...current, id: saved.id, createdAt: saved.createdAt, baseline: snapshot(current), status: "clean", error: null };
}
