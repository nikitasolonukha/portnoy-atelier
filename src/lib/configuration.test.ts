import { describe, expect, it } from "vitest";
import { diffConfigurations, normalizeConfiguration } from "./configuration";

describe("configuration helpers", () => {
  it("keeps only options belonging to active groups", () => {
    expect(normalizeConfiguration({ lapel: "peak", obsolete: "x" }, ["lapel", "buttons"])).toEqual({ lapel: "peak" });
  });

  it("returns only meaningful differences", () => {
    expect(diffConfigurations({ lapel: "notch", buttons: "two" }, { lapel: "peak", buttons: "two", vest: "double" })).toEqual([
      { key: "lapel", left: "notch", right: "peak" },
      { key: "vest", left: null, right: "double" },
    ]);
  });
});
