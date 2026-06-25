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
