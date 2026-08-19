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

  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    const errorMsg = await res.text().catch(() => "Unknown error");
    throw new Error(`API Error on ${path}: ${res.statusText} (${errorMsg})`);
  }

  // Detect HTML fallback (e.g. Vercel SPA routing returning index.html for /api routes)
  if (contentType.includes("text/html")) {
    throw new Error(`STATIC_FALLBACK: Endpoint ${path} returned HTML instead of JSON`);
  }

  const rawText = await res.text();
  if (rawText.trim().startsWith("<")) {
    throw new Error(`STATIC_FALLBACK: Endpoint ${path} returned HTML document`);
  }

  return JSON.parse(rawText) as T;
}

export const client = {
  getDb: () => request<DBState>("/db"),
  getQueryLogs: () => request<DbQueryLog[]>("/logs/query"),
  getAuditLogs: () => request<AuditLog[]>("/logs/audit"),
  getOrchestratorLogs: () => request<OrchestratorLog[]>("/logs/orchestrator"),
  getTelemetry: () => request<TelemetryStats>("/telemetry"),
};
