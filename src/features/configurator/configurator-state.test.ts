import { describe, expect, it } from "vitest";
import { createConfiguratorDraft, isConfiguratorDirty, markConfiguratorSaved, resetConfiguratorDraft, shouldNavigateToCanonicalConfiguration, withConfiguratorEdit } from "./configurator-state";

const defaults = { jacket: "single", lapel: "notch" };

describe("configurator state model", () => {
  it("creates a clean new draft from catalog defaults", () => {
    const state = createConfiguratorDraft(null, "fabric-1", defaults);
    expect(state).toMatchObject({ id: null, name: "Новая конфигурация", fabricId: "fabric-1", settings: defaults, status: "clean" });
    expect(isConfiguratorDirty(state)).toBe(false);
  });

  it("detects edits against the saved baseline", () => {
    const state = createConfiguratorDraft({ id: "cfg-1", name: "Navy", fabricId: "fabric-1", settings: defaults, createdBy: "owner", createdAt: "a", updatedAt: "b" }, "", {});
    expect(isConfiguratorDirty({ ...state, name: "Navy updated" })).toBe(true);
    expect(isConfiguratorDirty({ ...state, settings: { ...state.settings, lapel: "peak" } })).toBe(true);
  });

  it("resets edited values to the saved baseline", () => {
    const source = { id: "cfg-1", name: "Navy", fabricId: "fabric-1", settings: defaults, createdBy: "owner", createdAt: "a", updatedAt: "b" };
    const edited = withConfiguratorEdit(createConfiguratorDraft(source, "", {}), { name: "Changed", settings: { ...defaults, lapel: "peak" } });
    expect(resetConfiguratorDraft(edited)).toMatchObject({ name: "Navy", settings: defaults, status: "clean", error: null });
  });

  it("adopts the canonical id and becomes clean after first save", () => {
    const draft = { ...createConfiguratorDraft(null, "fabric-1", defaults), name: "Saved suit", status: "saving" as const };
    const saved = markConfiguratorSaved(draft, { id: "server-id", name: "Saved suit", fabricId: "fabric-1", settings: defaults, createdBy: "owner", createdAt: "a", updatedAt: "b" });
    expect(saved.id).toBe("server-id");
    expect(saved.status).toBe("clean");
    expect(isConfiguratorDirty(saved)).toBe(false);
  });

  it("navigates only when a save assigns a different canonical id", () => {
    expect(shouldNavigateToCanonicalConfiguration(null, "server-id")).toBe(true);
    expect(shouldNavigateToCanonicalConfiguration("server-id", "server-id")).toBe(false);
  });
});
