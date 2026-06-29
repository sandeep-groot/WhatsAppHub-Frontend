/**
 * Webhook module - handles webhook management
 */

export type WebhookStatus = "active" | "disabled" | "pending";

export interface EventProperty {
  event: string;
  properties: string[];
}

export interface Webhook {
  id: string;
  url: string;
  enabledEvents: string[];
  eventProperties?: EventProperty[];
  description?: string;
  status: WebhookStatus;
  secret?: string; // Appears on create or secret rotate response
  createdAt: string;
  updatedAt: string;
}

export interface CreateWebhookEndpointInput {
  url: string;
  enabledEvents: string[];
  description?: string;
  status?: WebhookStatus;
}

export interface UpdateWebhookEndpointInput {
  url?: string;
  enabledEvents?: string[];
  description?: string;
  status?: WebhookStatus;
}

export interface ListWebhookEndpointsResponse {
  data: Webhook[];
  total?: number;
}

/** A single event entry returned by v1/webhooks/event-types?format=grouped */
export interface WebhookEventItem {
  id: string;
  type: string;
  label: string;
  category: string;
  description: string;
  isActive: boolean;
}

/** A category group returned by v1/webhooks/event-types?format=grouped */
export interface WebhookEventGroup {
  category: string;
  events: WebhookEventItem[];
}

/** Full response envelope from v1/webhooks/event-types?format=grouped */
export interface ListWebhookEventTypesResponse {
  success: boolean;
  data: WebhookEventGroup[];
}
