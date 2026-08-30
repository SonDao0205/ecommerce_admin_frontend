import { apiBaseUrl, BaseApiService, httpClient } from "@/src/core/api";
import { tokenStorage } from "@/src/core/auth/token-storage";
import type { AuditLog } from "../types/audit-log";

export interface AuditLogStreamEvent {
  id?: string;
  action?: "INSERT" | "UPDATE" | "DELETE";
  entityName?: string;
}

export class AuditLogService extends BaseApiService {
  constructor() {
    super(httpClient, "/audit-logs");
  }

  getRecent(limit = 40): Promise<AuditLog[]> {
    return this.get<AuditLog[]>("", {
      params: { limit },
      cache: "no-store",
    });
  }

  subscribe(
    onAuditLog: (event: AuditLogStreamEvent) => void,
    onConnectionChange?: (connected: boolean) => void,
  ): () => void {
    const controller = new AbortController();
    let active = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const connect = async () => {
      const token = tokenStorage.getAccessToken();
      if (!active || !token) return;
      try {
        const response = await fetch(`${apiBaseUrl}/audit-logs/stream`, {
          headers: { Accept: "text/event-stream", Authorization: `Bearer ${token}` },
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok || !response.body) throw new Error("SSE connection failed");
        onConnectionChange?.(true);
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (active) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split("\n\n");
          buffer = messages.pop() ?? "";
          for (const message of messages) {
            const lines = message.split("\n");
            const event = lines
              .find((line) => line.startsWith("event:"))
              ?.slice(6)
              .trim();
            if (event !== "audit-log") continue;
            const rawData = lines
              .filter((line) => line.startsWith("data:"))
              .map((line) => line.slice(5).trimStart())
              .join("\n");
            try {
              const payload = JSON.parse(rawData) as AuditLogStreamEvent;
              onAuditLog(payload);
            } catch {
              onAuditLog({});
            }
          }
        }
      } catch (error) {
        if (active && !(error instanceof DOMException && error.name === "AbortError")) {
          onConnectionChange?.(false);
        }
      }
      if (active) retryTimer = setTimeout(() => void connect(), 3_000);
    };

    void connect();
    return () => {
      active = false;
      controller.abort();
      if (retryTimer) clearTimeout(retryTimer);
      onConnectionChange?.(false);
    };
  }
}

export const auditLogService = new AuditLogService();
