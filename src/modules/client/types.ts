/**
 * Client module - handles WhatsApp client related operations
 */

export interface Client {
  id: string;
  name: string;
  phoneNumber: string;
  status: "active" | "inactive" | "pending";
  createdAt: Date;
  updatedAt: Date;
}
