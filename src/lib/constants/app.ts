import type { Metadata } from "next";
import { env } from "@/lib/env";

export const APP_CONFIG = {
  name: env.NEXT_PUBLIC_APP_NAME,
  description: "WhatsApp Business Automation Platform",
  version: "1.0.0",
  logoAlt: "WhatsApp Hub",
  pageTitle: (page: string) => `${page} | ${env.NEXT_PUBLIC_APP_NAME}`,
  pageDescription: (text: string) => `${text} ${env.NEXT_PUBLIC_APP_NAME}`,
} as const;

/** @deprecated Use APP_CONFIG.name */
export const APP_NAME = APP_CONFIG.name;

/** @deprecated Use APP_CONFIG.version */
export const APP_VERSION = APP_CONFIG.version;

export const PAGE_METADATA = {
  dashboard: {
    title: "Dashboard",
    description: "Backend system health and status",
  },
  signIn: {
    title: "Sign In",
    description: "Sign in to your WhatsAppHub account",
  },
  signUp: {
    title: "Sign Up",
    description: "Create a new WhatsAppHub account",
  },
  forgotPassword: {
    title: "Forgot Password",
    description: "Reset your WhatsAppHub password",
  },
  onboarding: {
    title: "Onboarding",
    description: "Complete your WhatsAppHub setup",
  },
  messages: {
    title: "Send WhatsApp Message",
    heading: "Send WhatsApp Message",
    description:
      "Send a test message from WhatsAppHub using pre-approved templates or free-form text.",
  },
  clients: {
    title: "Clients",
    heading: "Clients",
    description: "Manage WhatsApp Business accounts, WABAs, and phone numbers.",
  },
  connections: {
    title: "Connections",
    heading: "Connections",
    description: "View and manage WhatsApp connection directory.",
  },
  webhooks: {
    title: "Webhooks",
    heading: "Webhook Integrations",
    description: "Manage YCloud webhook endpoints for real-time WhatsApp events.",
  },
  auditLogs: {
    title: "Audit Logs",
    heading: "Audit Logs",
    description: "Track system activity across WhatsAppHub.",
  },
  users: {
    title: "Users",
    description: "Manage users and their permissions",
  },
  roles: {
    title: "Roles",
    description: "Manage user roles and permissions",
  },
  settings: {
    title: "Settings",
    description: "Manage your account settings",
  },
  terms: {
    title: "Terms of Service",
    description: "Terms of Service for",
  },
  privacy: {
    title: "Privacy Policy",
    description: "Privacy Policy for",
  },
  dataDeletion: {
    title: "Data Deletion Instructions",
    description: "How to request deletion of your data from",
  },
} as const;

export type PageMetadataKey = keyof typeof PAGE_METADATA;

export function createPageMetadata(key: PageMetadataKey): Metadata {
  const page = PAGE_METADATA[key];
  return {
    title: APP_CONFIG.pageTitle(page.title),
    description:
      page.description.endsWith("for") || page.description.endsWith("from")
        ? APP_CONFIG.pageDescription(page.description)
        : page.description,
  };
}
