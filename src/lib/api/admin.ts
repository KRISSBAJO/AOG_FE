import { jsonBody, ListResponse, Query, withQuery, workspaceRequest } from "./workspace-request";

export type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
  actor?: { id: string; displayName: string; email: string } | null;
};

export type SystemSetting = {
  id: string;
  key: string;
  value: unknown;
  category?: string | null;
  description?: string | null;
  updatedAt: string;
};

export type BackgroundJob = {
  id: string;
  type: string;
  status: string;
  payload: unknown;
  attempts: number;
  maxAttempts: number;
  runAt: string;
  lastError?: string | null;
  createdAt: string;
};

export type BackgroundJobResponse = ListResponse<BackgroundJob> & {
  summary: { byStatus: Array<{ status: string; _count: { _all: number } }> };
};

export const adminApi = {
  auditLogs: (query?: Query) =>
    workspaceRequest<ListResponse<AuditLog>>(withQuery("/audit-logs", query)),
  systemSettings: (query?: Query) =>
    workspaceRequest<ListResponse<SystemSetting>>(withQuery("/system-settings", query)),
  upsertSystemSetting: (key: string, input: Record<string, unknown>) =>
    workspaceRequest<SystemSetting>(`/system-settings/${encodeURIComponent(key)}`, {
      method: "PATCH",
      body: jsonBody(input),
    }),
  backgroundJobs: (query?: Query) =>
    workspaceRequest<BackgroundJobResponse>(withQuery("/background-jobs", query)),
  createBackgroundJob: (input: Record<string, unknown>) =>
    workspaceRequest<BackgroundJob>("/background-jobs", {
      method: "POST",
      body: jsonBody(input),
    }),
  retryBackgroundJob: (id: string) =>
    workspaceRequest<BackgroundJob>(`/background-jobs/${id}/retry`, { method: "POST" }),
};
