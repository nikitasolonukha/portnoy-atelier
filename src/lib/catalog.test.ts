import { describe, expect, it } from "vitest";
import { filterFabrics, sortFabrics } from "./catalog";

const fabrics = [
  { id: "1", article: "VB-2401", name: "Midnight Hopsack", manufacturer: "Vitale Barberis", mainColor: "Синий", pattern: "Однотонная", isActive: true },
  { id: "2", article: "LP-772", name: "Prince of Wales", manufacturer: "Loro Piana", mainColor: "Серый", pattern: "Клетка", isActive: true },
  { id: "3", article: "DR-019", name: "Charcoal Flannel", manufacturer: "Drapers", mainColor: "Серый", pattern: "Однотонная", isActive: false },
];

describe("fabric catalog", () => {
  it("searches article and manufacturer case-insensitively", () => {
    expect(filterFabrics(fabrics, { query: "vb-24" })).toHaveLength(1);
    expect(filterFabrics(fabrics, { query: "loro" })[0]?.id).toBe("2");
  });

  it("combines color, pattern and archive filters", () => {
    expect(filterFabrics(fabrics, { color: "Серый", pattern: "Однотонная", status: "archived" }).map((item) => item.id)).toEqual(["3"]);
  });

  it("sorts without mutating the source", () => {
    const result = sortFabrics(fabrics, "name-asc");
    expect(result.map((item) => item.id)).toEqual(["3", "1", "2"]);
    expect(fabrics[0]?.id).toBe("1");
  });
});
