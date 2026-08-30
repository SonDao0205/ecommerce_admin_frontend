"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { auditLogService } from "../api/audit-log.service";
import type { AuditLogStreamEvent } from "../api/audit-log.service";

export const auditLogKeys = {
  all: ["audit-logs"] as const,
  recent: (limit: number) => [...auditLogKeys.all, "recent", limit] as const,
};

export function useAuditLogs(limit = 40, enabled = true) {
  return useQuery({
    queryKey: auditLogKeys.recent(limit),
    queryFn: () => auditLogService.getRecent(limit),
    enabled,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });
}

export function useAuditLogStream(
  onAuditLog?: (event: AuditLogStreamEvent) => void,
) {
  const queryClient = useQueryClient();
  const callbackRef = useRef(onAuditLog);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    callbackRef.current = onAuditLog;
  }, [onAuditLog]);

  useEffect(
    () =>
      auditLogService.subscribe(
        (event) => {
          void queryClient.invalidateQueries({ queryKey: auditLogKeys.all });
          callbackRef.current?.(event);
        },
        setConnected,
      ),
    [queryClient],
  );

  return connected;
}
