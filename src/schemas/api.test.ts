import { describe, expect, it } from "vitest";
import { fabricListQuerySchema } from "./api";

describe("fabricListQuerySchema", () => {
  it("normalizes valid query values", () => {
    expect(fabricListQuerySchema.parse({ q: " wool ", status: "active", limit: "25" })).toEqual({
      q: "wool",
      status: "active",
      limit: 25,
      page: 1,
    });
  });

  it.each([
    { status: "deleted" },
    { limit: "0" },
    { limit: "201" },
    { limit: "not-a-number" },
    { page: "0" },
  ])("rejects invalid input: %o", (input) => {
    expect(() => fabricListQuerySchema.parse(input)).toThrow();
  });
});
