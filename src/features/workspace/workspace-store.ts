"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { demoConfigurations, demoFabrics, demoGroups } from "@/lib/demo-data";
import { requestData } from "@/lib/http-client";
import type { ConfigurationGroup, Fabric, SavedConfiguration } from "@/types/domain";

const usesSupabase = process.env.NEXT_PUBLIC_APP_MODE === "supabase";

type WorkspaceState = {
  fabrics: Fabric[];
  configurations: SavedConfiguration[];
  groups: ConfigurationGroup[];
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  addFabric: (fabric: Fabric) => Promise<Fabric>;
  updateFabric: (id: string, patch: Partial<Fabric>) => Promise<Fabric>;
  saveConfiguration: (configuration: SavedConfiguration) => Promise<SavedConfiguration>;
  deleteConfiguration: (id: string) => Promise<void>;
  resetDemo: () => void;
};

function fabricPayload(fabric: Fabric) {
  return { article: fabric.article, name: fabric.name, manufacturer: fabric.manufacturer, collection: fabric.collection, composition: fabric.composition, mainColor: fabric.mainColor, pattern: fabric.pattern, weightGsm: fabric.weightGsm, widthCm: fabric.widthCm, pricePerMeter: fabric.pricePerMeter, currency: fabric.currency, description: fabric.description };
}

export const useWorkspace = create<WorkspaceState>()(persist((set, get) => ({
  fabrics: demoFabrics,
  configurations: demoConfigurations,
  groups: demoGroups,
  hydrated: !usesSupabase,
  loading: false,
  error: null,
  hydrate: async () => {
    if (!usesSupabase || get().loading) return;
    set({ loading: true, error: null });
    try {
      const [fabrics, configurations, groups] = await Promise.all([
        requestData<Fabric[]>("/api/v1/fabrics?status=all"),
        requestData<SavedConfiguration[]>("/api/v1/configurations"),
        requestData<ConfigurationGroup[]>("/api/v1/configuration-groups"),
      ]);
      set({ fabrics, configurations, groups, hydrated: true, loading: false });
    } catch (cause) {
      set({ loading: false, error: cause instanceof Error ? cause.message : "Не удалось загрузить рабочее пространство" });
    }
  },
  addFabric: async (fabric) => {
    if (!usesSupabase) { set((state) => ({ fabrics: [fabric, ...state.fabrics] })); return fabric; }
    const created = await requestData<Fabric>("/api/v1/fabrics", { method: "POST", body: JSON.stringify(fabricPayload(fabric)) });
    set((state) => ({ fabrics: [created, ...state.fabrics] }));
    return created;
  },
  updateFabric: async (id, patch) => {
    if (!usesSupabase) {
      const updated = { ...get().fabrics.find((fabric) => fabric.id === id)!, ...patch, updatedAt: new Date().toISOString() };
      set((state) => ({ fabrics: state.fabrics.map((fabric) => fabric.id === id ? updated : fabric) }));
      return updated;
    }
    const updated = await requestData<Fabric>(`/api/v1/fabrics/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
    set((state) => ({ fabrics: state.fabrics.map((fabric) => fabric.id === id ? updated : fabric) }));
    return updated;
  },
  saveConfiguration: async (configuration) => {
    if (!usesSupabase) {
      set((state) => ({ configurations: [configuration, ...state.configurations.filter((item) => item.id !== configuration.id)] }));
      return configuration;
    }
    const existing = get().configurations.some((item) => item.id === configuration.id);
    const saved = await requestData<SavedConfiguration>(existing ? `/api/v1/configurations/${configuration.id}` : "/api/v1/configurations", { method: existing ? "PATCH" : "POST", body: JSON.stringify({ name: configuration.name, fabricId: configuration.fabricId, settings: configuration.settings }) });
    set((state) => ({ configurations: [saved, ...state.configurations.filter((item) => item.id !== saved.id)] }));
    return saved;
  },
  deleteConfiguration: async (id) => {
    if (usesSupabase) {
      const response = await fetch(`/api/v1/configurations/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Не удалось удалить конфигурацию");
    }
    set((state) => ({ configurations: state.configurations.filter((item) => item.id !== id) }));
  },
  resetDemo: () => { if (!usesSupabase) set({ fabrics: demoFabrics, configurations: demoConfigurations, groups: demoGroups, error: null }); },
}), { name: "portnoy-workspace-v2", version: 2, partialize: (state) => ({ fabrics: state.fabrics, configurations: state.configurations }) }));