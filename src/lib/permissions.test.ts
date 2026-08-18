import { describe, expect, it } from "vitest";
import { can } from "./permissions";

describe("permission matrix", () => {
  it("matches the existing backend fabric permissions", () => {
    expect(can("admin", "fabric:create")).toBe(true);
    expect(can("admin", "fabric:delete")).toBe(true);
    expect(can("tailor", "fabric:create")).toBe(true);
    expect(can("tailor", "fabric:delete")).toBe(false);
    expect(can("employee", "fabric:create")).toBe(false);
    expect(can("employee", "fabric:read")).toBe(true);
  });

  it("keeps configuration option management admin-only", () => {
    expect(can("admin", "configuration-options:manage")).toBe(true);
    expect(can("tailor", "configuration-options:manage")).toBe(false);
    expect(can("employee", "configuration-options:manage")).toBe(false);
  });
});
