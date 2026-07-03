import type { ReactNode } from "react";
import {
  AuditIcon,
  ClientsIcon,
  ConnectionsIcon,
  DashboardIcon,
  OnboardingIcon,
  SendMessageIcon,
  UsersIcon,
  WebhooksIcon,
} from "@/icons";
import type { NavIconKey } from "./navigation";

const NAV_ICON_MAP: Record<NavIconKey, ReactNode> = {
  dashboard: <DashboardIcon />,
  clients: <ClientsIcon />,
  connections: <ConnectionsIcon className="w-5 h-5" />,
  sendMessage: <SendMessageIcon />,
  onboarding: <OnboardingIcon />,
  users: <UsersIcon />,
  roles: <UsersIcon />,
  webhooks: <WebhooksIcon />,
  auditLogs: <AuditIcon />,
  settings: <DashboardIcon />,
};

export function resolveNavIcon(icon: NavIconKey): ReactNode {
  return NAV_ICON_MAP[icon];
}
