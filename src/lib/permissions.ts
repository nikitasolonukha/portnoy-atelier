import type { AppRole, CurrentUser } from "@/types/auth";

export type Permission =
  | "fabric:read"
  | "fabric:create"
  | "fabric:update"
  | "fabric:archive"
  | "fabric:delete"
  | "fabric:import"
  | "fabric-assets:manage"
  | "configuration:create"
  | "configuration-options:manage";

const permissions: Record<AppRole, ReadonlySet<Permission>> = {
  admin: new Set([
    "fabric:read", "fabric:create", "fabric:update", "fabric:archive", "fabric:delete",
    "fabric:import", "fabric-assets:manage", "configuration:create", "configuration-options:manage",
  ]),
  tailor: new Set([
    "fabric:read", "fabric:create", "fabric:update", "fabric:archive", "fabric:import",
    "fabric-assets:manage", "configuration:create",
  ]),
  employee: new Set(["fabric:read", "configuration:create"]),
};

export function can(role: AppRole, permission: Permission) {
  return permissions[role].has(permission);
}

export function canMutateConfiguration(user: CurrentUser, ownerId: string) {
  return user.role === "admin" || user.id === ownerId;
}
