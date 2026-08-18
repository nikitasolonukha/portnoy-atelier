import { describe, expect, it } from "vitest";
import { applyColumnMapping, suggestColumnMapping } from "./import-workflow";

describe("import column mapping", () => {
  it("suggests known aliases but keeps mapping editable", () => {
    expect(suggestColumnMapping(["Артикул", "Наименование", "Фабрика", "Неизвестно"])).toEqual({
      "Артикул": "article",
      "Наименование": "name",
      "Фабрика": "manufacturer",
      "Неизвестно": "",
    });
  });

  it("applies the user-selected mapping and ignores unmapped columns", () => {
    expect(applyColumnMapping([
      { SKU: "A-1", Title: "Blue", Notes: "ignore" },
    ], { SKU: "article", Title: "name", Notes: "" })).toEqual([
      { article: "A-1", name: "Blue" },
    ]);
  });
});
