/**
 * Application route paths (frontend pages and backend API endpoints).
 */

export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    ME: "/auth/me",
    LOGOUT: "/auth/logout",
    SIGNUP: "/auth/signup",
    REFRESH: "/auth/refresh",
  },
  CLIENTS: "/clients",
  WEBHOOKS: "/webhooks",
  USERS: "/users",
  ROLES: "/roles",
  AUDIT_LOGS: "/audit-logs",
} as const;

export const PAGE_ROUTES = {
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/forgot-password",
  PRIVACY: "/privacy",
  TERMS: "/terms",
  DATA_DELETION: "/data-deletion",
  DASHBOARD: "/dashboard",
  CLIENTS: "/clients",
  CONNECTIONS: "/connections",
  ONBOARDING: "/onboarding",
  MESSAGES: "/messages",
  WEBHOOKS: "/webhook",
  AUDIT_LOGS: "/audit-logs",
  USERS: "/users",
  ROLES: "/roles",
  SETTINGS: "/settings",
} as const;
