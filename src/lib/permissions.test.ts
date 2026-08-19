import { describe, expect, it } from "vitest";
import { can, canMutateConfiguration } from "./permissions";

describe("permission matrix", () => {
  it("matches the existing backend fabric permissions", () => {
    expect(can("admin", "fabric:create")).toBe(true);
    expect(can("admin", "fabric:delete")).toBe(true);
    expect(can("tailor", "fabric:create")).toBe(true);
    expect(can("tailor", "fabric:delete")).toBe(false);
    expect(can("employee", "fabric:create")).toBe(false);
    expect(can("employee", "fabric:read")).toBe(true);
  });

  it("allows configuration mutations only for the owner or an admin", () => {
    expect(canMutateConfiguration({ id: "admin-1", fullName: "Admin", role: "admin" }, "employee-1")).toBe(true);
    expect(canMutateConfiguration({ id: "tailor-1", fullName: "Tailor", role: "tailor" }, "tailor-1")).toBe(true);
    expect(canMutateConfiguration({ id: "tailor-1", fullName: "Tailor", role: "tailor" }, "employee-1")).toBe(false);
    expect(canMutateConfiguration({ id: "employee-1", fullName: "Employee", role: "employee" }, "employee-1")).toBe(true);
  });
  it("keeps configuration option management admin-only", () => {
    expect(can("admin", "configuration-options:manage")).toBe(true);
    expect(can("tailor", "configuration-options:manage")).toBe(false);
    expect(can("employee", "configuration-options:manage")).toBe(false);
  });
});
