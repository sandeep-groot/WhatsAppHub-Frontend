import { FEATURES } from "@/lib/constants/features";
import { PAGE_ROUTES } from "@/lib/constants/routes";

export type NavIconKey =
  | "dashboard"
  | "clients"
  | "connections"
  | "sendMessage"
  | "onboarding"
  | "users"
  | "roles"
  | "webhooks"
  | "auditLogs"
  | "settings";

export interface NavItemConfig {
  name: string;
  path: string;
  icon: NavIconKey;
}

function whenEnabled(
  feature: keyof typeof FEATURES,
  items: NavItemConfig[]
): NavItemConfig[] {
  return FEATURES[feature] ? items : [];
}

export const MAIN_NAV_ITEMS: NavItemConfig[] = [
  { name: "Dashboard", path: PAGE_ROUTES.DASHBOARD, icon: "dashboard" },
  { name: "Clients", path: PAGE_ROUTES.CLIENTS, icon: "clients" },
  ...whenEnabled("connections", [
    { name: "Connections", path: PAGE_ROUTES.CONNECTIONS, icon: "connections" },
  ]),
  { name: "Send Message", path: PAGE_ROUTES.MESSAGES, icon: "sendMessage" },
  { name: "Onboarding", path: PAGE_ROUTES.ONBOARDING, icon: "onboarding" },
];

export const MANAGEMENT_NAV_ITEMS: NavItemConfig[] = [
  ...whenEnabled("users", [
    { name: "Users", path: PAGE_ROUTES.USERS, icon: "users" },
  ]),
  ...whenEnabled("roles", [
    { name: "Roles", path: PAGE_ROUTES.ROLES, icon: "roles" },
  ]),
  { name: "Webhooks", path: PAGE_ROUTES.WEBHOOKS, icon: "webhooks" },
  { name: "Audit Logs", path: PAGE_ROUTES.AUDIT_LOGS, icon: "auditLogs" },
];
