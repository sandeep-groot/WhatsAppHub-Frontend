/**
 * Webhook module - handles webhook management
 */

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookEvent {
  id: string;
  webhookId: string;
  type: string;
  payload: Record<string, unknown>;
  sentAt: Date;
}
