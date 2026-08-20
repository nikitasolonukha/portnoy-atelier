import { afterEach, describe, expect, it, vi } from "vitest";
import { FABRIC_VIEW_STORAGE_KEY, readFabricViewPreference, writeFabricViewPreference } from "./fabric-view-preference";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => { map.set(key, value); },
    removeItem: (key: string) => { map.delete(key); },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fabric view preference", () => {
  it("reads and writes grid/list preference", () => {
    const storage = memoryStorage();
    vi.stubGlobal("window", { localStorage: storage });
    writeFabricViewPreference("list");
    expect(readFabricViewPreference()).toBe("list");
    writeFabricViewPreference("grid");
    expect(readFabricViewPreference()).toBe("grid");
  });

  it("ignores invalid stored values", () => {
    const storage = memoryStorage();
    storage.setItem(FABRIC_VIEW_STORAGE_KEY, "cards");
    vi.stubGlobal("window", { localStorage: storage });
    expect(readFabricViewPreference()).toBeNull();
  });

  it("does not throw when localStorage is unavailable", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: () => {
          throw new Error("blocked");
        },
      },
    });
    expect(readFabricViewPreference()).toBeNull();
    expect(() => writeFabricViewPreference("list")).not.toThrow();
  });
});
