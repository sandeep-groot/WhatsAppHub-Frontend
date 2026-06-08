/**
 * User module - handles user management
 */

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roleId: string;
  status: "active" | "inactive" | "suspended";
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  roleId: string;
}

export interface UpdateUserRequest {
  name?: string;
  roleId?: string;
  status?: "active" | "inactive" | "suspended";
}
