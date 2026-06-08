/**
 * Permission-related utility functions for RBAC
 */

export type Permission = string;
export type Role = string;

interface RolePermissionMap {
  [role: string]: Permission[];
}

// Define your role-permission mapping here
const ROLE_PERMISSIONS: RolePermissionMap = {
  admin: ["*"], // All permissions
  manager: ["read:clients", "write:clients", "read:users", "read:webhooks"],
  user: ["read:clients", "read:webhooks"],
};

export function hasPermission(
  userRole: Role,
  permission: Permission,
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  return permissions.includes("*") || permissions.includes(permission);
}

export function hasAnyPermission(
  userRole: Role,
  permissions: Permission[],
): boolean {
  return permissions.some((p) => hasPermission(userRole, p));
}

export function hasAllPermissions(
  userRole: Role,
  permissions: Permission[],
): boolean {
  return permissions.every((p) => hasPermission(userRole, p));
}
