import type { AuthUser } from "@/modules/auth/types";
import type { StoredAuthUser } from "./index";

export function toStoredUser(user: AuthUser): StoredAuthUser {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles,
    name: name || user.email,
  };
}
