import { db } from "~/server/db";
import { auditLogs } from "~/server/db/schema";
import { logger } from "~/lib/logger";

export type AuditEvent = {
  event: string;
  action: string;
  resource: string;
  allowed: boolean;
  actorUserId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown> | string | null;
};

export async function writeAuditLog(ev: AuditEvent) {
  try {
    const metadataStr = typeof ev.metadata === "string" ? ev.metadata : ev.metadata ? JSON.stringify(ev.metadata) : null;
    await db.insert(auditLogs).values({
      event: ev.event,
      action: ev.action,
      resource: ev.resource,
      allowed: ev.allowed,
      actorUserId: ev.actorUserId ?? null,
      ip: ev.ip ?? null,
      userAgent: ev.userAgent ?? null,
      metadata: metadataStr ?? null,
    });
    logger.security(`Audit: ${ev.event}`, { action: ev.action, resource: ev.resource, allowed: ev.allowed });
  } catch (err) {
    logger.error("Failed to write audit log", { error: (err as Error).message });
  }
}
