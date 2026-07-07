import { DBState, DbQueryLog, AuditLog, OrchestratorLog, TelemetryStats } from "../types";

export const API_BASE = "/api";

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const errorMsg = await res.text().catch(() => "Unknown error");
    throw new Error(`API Error on ${path}: ${res.statusText} (${errorMsg})`);
  }

  return res.json();
}

export const client = {
  getDb: () => request<DBState>("/db"),
  getQueryLogs: () => request<DbQueryLog[]>("/logs/query"),
  getAuditLogs: () => request<AuditLog[]>("/logs/audit"),
  getOrchestratorLogs: () => request<OrchestratorLog[]>("/logs/orchestrator"),
  getTelemetry: () => request<TelemetryStats>("/telemetry"),
};
