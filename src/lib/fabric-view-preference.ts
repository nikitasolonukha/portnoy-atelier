export type FabricCatalogView = "grid" | "list";

export const FABRIC_VIEW_STORAGE_KEY = "portnoy:fabrics:view";

export function readFabricViewPreference(): FabricCatalogView | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    const value = window.localStorage.getItem(FABRIC_VIEW_STORAGE_KEY);
    return value === "grid" || value === "list" ? value : null;
  } catch {
    return null;
  }
}

export function writeFabricViewPreference(view: FabricCatalogView): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) return;
    window.localStorage.setItem(FABRIC_VIEW_STORAGE_KEY, view);
  } catch {
    // localStorage may be unavailable (private mode / policy); preference is best-effort.
  }
}
