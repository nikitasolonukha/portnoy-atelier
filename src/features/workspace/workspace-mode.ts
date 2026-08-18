import { demoConfigurations, demoFabrics, demoGroups } from "@/lib/demo-data";
import type { ConfigurationGroup, Fabric, SavedConfiguration } from "@/types/domain";

export type WorkspaceStatus = "idle" | "loading" | "ready" | "error";

export type WorkspaceData = {
  fabrics: Fabric[];
  configurations: SavedConfiguration[];
  groups: ConfigurationGroup[];
  status: WorkspaceStatus;
  error: string | null;
};

export function createInitialWorkspaceData(mode: "demo" | "supabase"): WorkspaceData {
  if (mode === "supabase") return { fabrics: [], configurations: [], groups: [], status: "idle", error: null };
  return {
    fabrics: structuredClone(demoFabrics),
    configurations: structuredClone(demoConfigurations),
    groups: structuredClone(demoGroups),
    status: "ready",
    error: null,
  };
}
