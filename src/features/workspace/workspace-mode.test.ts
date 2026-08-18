import { describe, expect, it } from "vitest";
import { createInitialWorkspaceData } from "./workspace-mode";

describe("workspace data ownership", () => {
  it("starts Supabase mode empty and idle", () => {
    const state = createInitialWorkspaceData("supabase");
    expect(state).toEqual({ fabrics: [], configurations: [], groups: [], status: "idle", error: null });
  });

  it("starts demo mode from explicit demo data", () => {
    const state = createInitialWorkspaceData("demo");
    expect(state.status).toBe("ready");
    expect(state.fabrics.length).toBeGreaterThan(0);
    expect(state.configurations.length).toBeGreaterThan(0);
    expect(state.groups.length).toBeGreaterThan(0);
  });
});
