/**
 * Audit module - handles audit logging and tracking.
 * Shapes mirror GET v1/audit-logs.
 */

export interface AuditActor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  actor: AuditActor | null;
}

export interface AuditLogMeta {
  page: number;
  limit: number;
  total: number;
}

export interface AuditLogPage {
  items: AuditLog[];
  meta: AuditLogMeta;
}

export interface ListAuditLogsParams {
  page?: number;
  limit?: number;
  actorId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
}
