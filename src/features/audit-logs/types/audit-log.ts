export interface AuditLog {
  id: string;
  action: "INSERT" | "UPDATE" | "DELETE";
  entityName: string;
  entityId: string | null;
  description: string;
  actorId: string | null;
  actorName: string;
  actorEmail: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  createdAt: string;
}
