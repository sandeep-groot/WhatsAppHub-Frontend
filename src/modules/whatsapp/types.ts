/**
 * WhatsApp domain types (message sending + template listing).
 */

export type WhatsAppMessageType = "template" | "text";

/* ------------------------------------------------------------------ */
/* Send message (POST v1/whatsapp/messages/send)                       */
/* ------------------------------------------------------------------ */

export interface TemplateLanguagePayload {
  code: string;
  policy?: string;
}

export interface TemplateParameterPayload {
  type: "text";
  text: string;
}

export interface TemplateComponentPayload {
  type: string; // e.g. "body"
  sub_type?: string;
  index?: string;
  parameters?: TemplateParameterPayload[];
}

export interface SendTemplatePayload {
  name: string;
  language: TemplateLanguagePayload;
  components?: TemplateComponentPayload[];
}

export interface SendMessageInput {
  type: WhatsAppMessageType;
  from: string;
  to: string;
  /** Present when type is "text". */
  text?: { body: string };
  /** Present when type is "template". */
  template?: SendTemplatePayload;
}

export interface SendMessageContact {
  input?: string;
  wa_id?: string;
}

export interface SendMessageStatus {
  id?: string;
  message_status?: string;
}

/** Response from v1/whatsapp/messages/send (shape kept permissive). */
export interface SendMessageResult {
  id?: string;
  messaging_product?: string;
  contacts?: SendMessageContact[];
  messages?: SendMessageStatus[];
  [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/* Template listing (GET v1/integrations/ycloud/whatsapp/templates)    */
/* ------------------------------------------------------------------ */

export interface WhatsAppTemplateComponentExample {
  body_text?: string[][];
}

export interface WhatsAppTemplateButton {
  type: string;
  text: string;
}

export interface WhatsAppTemplateComponent {
  type: string; // BODY | HEADER | FOOTER | BUTTONS
  text?: string;
  example?: WhatsAppTemplateComponentExample;
  buttons?: WhatsAppTemplateButton[];
}

export interface WhatsAppTemplate {
  officialTemplateId: string;
  wabaId: string;
  name: string;
  language: string;
  messageSendTtlSeconds?: number;
  components: WhatsAppTemplateComponent[];
  category?: string;
  previousCategory?: string;
  status: string;
  qualityRating?: string;
  createTime?: string;
  updateTime?: string;
  statusUpdateEvent?: string;
}

export interface ListTemplatesResponse {
  offset: number;
  limit: number;
  length: number;
  items: WhatsAppTemplate[];
}

export interface ListTemplatesParams {
  page?: number;
  limit?: number;
  includeTotal?: boolean;
}
