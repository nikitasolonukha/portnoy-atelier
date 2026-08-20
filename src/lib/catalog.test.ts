import { describe, expect, it } from "vitest";
import { filterFabrics, sortFabrics, uniqueCatalogValues } from "./catalog";

const fabrics = [
  { id: "1", article: "VB-2401", name: "Midnight Hopsack", manufacturer: "Vitale Barberis", composition: "100% шерсть", mainColor: "Синий", pattern: "Однотонная", isActive: true, createdAt: "2026-08-10T10:00:00Z" },
  { id: "2", article: "LP-772", name: "Prince of Wales", manufacturer: "Loro Piana", composition: "Шерсть / шёлк", mainColor: "Серый", pattern: "Клетка", isActive: true, createdAt: "2026-08-18T10:00:00Z" },
  { id: "3", article: "DR-019", name: "Charcoal Flannel", manufacturer: "Drapers", composition: "100% шерсть", mainColor: "Серый", pattern: "Однотонная", isActive: false, createdAt: "2026-08-01T10:00:00Z" },
  { id: "4", article: "VB-1100", name: "Navy Fresco", manufacturer: "Vitale Barberis", composition: "100% шерсть", mainColor: "Синий", pattern: "Однотонная", isActive: true, createdAt: "2026-08-15T10:00:00Z" },
];

describe("fabric catalog", () => {
  it("searches article and manufacturer case-insensitively", () => {
    expect(filterFabrics(fabrics, { query: "vb-24" })).toHaveLength(1);
    expect(filterFabrics(fabrics, { query: "loro" })[0]?.id).toBe("2");
  });

  it("filters by manufacturer as OR multi-select", () => {
    expect(filterFabrics(fabrics, { manufacturers: ["Vitale Barberis", "Loro Piana"], status: "all" }).map((item) => item.id)).toEqual(["1", "2", "4"]);
  });

  it("filters by exact composition values", () => {
    expect(filterFabrics(fabrics, { compositions: ["Шерсть / шёлк"] }).map((item) => item.id)).toEqual(["2"]);
    expect(filterFabrics(fabrics, { compositions: ["100% шерсть"], status: "all" })).toHaveLength(3);
  });

  it("combines manufacturer, composition, color, pattern and archive filters", () => {
    expect(filterFabrics(fabrics, {
      manufacturers: ["Vitale Barberis", "Drapers"],
      compositions: ["100% шерсть"],
      color: "Серый",
      pattern: "Однотонная",
      status: "archived",
    }).map((item) => item.id)).toEqual(["3"]);
  });

  it("sorts newest and oldest by createdAt without mutating source", () => {
    expect(sortFabrics(fabrics, "newest").map((item) => item.id)).toEqual(["2", "4", "1", "3"]);
    expect(sortFabrics(fabrics, "oldest").map((item) => item.id)).toEqual(["3", "1", "4", "2"]);
    expect(fabrics[0]?.id).toBe("1");
  });

  it("sorts by name without mutating the source", () => {
    const result = sortFabrics(fabrics, "name-asc");
    expect(result.map((item) => item.id)).toEqual(["3", "1", "4", "2"]);
    expect(fabrics[0]?.id).toBe("1");
  });

  it("collects unique manufacturer and composition values dynamically", () => {
    expect(uniqueCatalogValues(fabrics, "manufacturer")).toEqual(["Drapers", "Loro Piana", "Vitale Barberis"]);
    expect(uniqueCatalogValues(fabrics, "composition")).toEqual(["100% шерсть", "Шерсть / шёлк"]);
  });
});
