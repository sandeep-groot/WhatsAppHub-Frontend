import type { AccountKpis } from "@/modules/clients/types";

export const NAV_SECTION_LABELS = {
  main: "Main",
  management: "Management",
} as const;

export const FOOTER_LINK_LABELS = {
  terms: "Terms of Service",
  privacy: "Privacy Policy",
  dataDeletion: "Data Deletion",
  dataDeletionTitle: "Data Deletion Instructions",
} as const;

export const KPI_CARD_COPY: {
  key: keyof AccountKpis;
  label: string;
  subtitle: string;
  iconBg: string;
  showStatusDot?: boolean;
  dotColor?: string;
}[] = [
  {
    key: "businessCount",
    label: "Business Accounts",
    subtitle: "Registered Meta businesses",
    iconBg: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    key: "wabaCount",
    label: "WABA Accounts",
    subtitle: "WhatsApp Business Accounts",
    iconBg: "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
  {
    key: "phoneCount",
    label: "Phone Numbers",
    subtitle: "Registered sender numbers",
    iconBg: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  {
    key: "connected",
    label: "Connected",
    subtitle: "Active phone numbers",
    showStatusDot: true,
    dotColor: "bg-emerald-500",
    iconBg: "bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400",
  },
];

export const EMPTY_STATE_COPY = {
  clients: {
    title: "No Business Accounts Found",
    description:
      "No accounts match your search. Adjust the filter or connect a new WABA.",
    loading: "Loading business accounts...",
  },
  connections: {
    title: "No Connections Found",
    description:
      "No connections match the active search filters. Adjust filters or register a new WABA.",
    loading: "Loading connection directory...",
  },
  webhooks: {
    errorTitle: "Failed to load webhooks",
    errorFallback:
      "The server responded with an error. Check your connection or credentials.",
    tryAgain: "Try Again",
    emptyTitle: "No Webhook Endpoints",
    emptyDescription:
      "You haven't configured any YCloud webhook endpoints yet. Register one to start routing live events.",
    emptyAction: "Configure Webhook",
    addButton: "Add Webhook",
    pageDescription:
      "Manage YCloud webhook endpoints to receive real-time updates for WhatsApp events.",
  },
  auditLogs: {
    emptyTitle: "No audit logs yet",
    emptySearchTitle: "No matching entries",
    emptyDescription: "System activity will appear here as users perform actions.",
    emptySearchDescription:
      "Try a different search term or clear the search to see all loaded entries.",
    pageDescription:
      "Track system activity across WhatsAppHub. Search the feed and scroll to load more entries automatically.",
  },
  messages: {
    pageTitle: "Send WhatsApp Message",
    pageDescription:
      "Send a test message from WhatsAppHub. Choose a pre-approved template to start a conversation, or send free-form text inside an open 24-hour customer window.",
  },
  messageConsole: {
    description: "Select a customer connection on the left to view message logs.",
  },
} as const;
