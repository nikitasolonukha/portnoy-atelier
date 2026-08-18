import { describe, expect, it } from "vitest";
import { validateImportRows } from "./import";

describe("fabric import", () => {
  it("separates valid and invalid rows with row numbers", () => {
    const result = validateImportRows([
      { article: "A-1", name: "Blue Wool" },
      { article: "", name: "Missing article" },
    ]);
    expect(result.valid).toHaveLength(1);
    expect(result.invalid).toEqual([{ row: 3, issues: ["Укажите артикул"] }]);
  });
});
