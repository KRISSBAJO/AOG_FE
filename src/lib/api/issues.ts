import { Customer, Facility } from "@/lib/phase3-api";
import { jsonBody, ListResponse, Query, withQuery, workspaceRequest } from "./workspace-request";

export type Complaint = {
  id: string;
  customerId: string;
  facilityId?: string | null;
  status: string;
  priority: string;
  title: string;
  description: string;
  resolution?: string | null;
  dueAt?: string | null;
  resolvedAt?: string | null;
  customer?: Pick<Customer, "id" | "name">;
  facility?: Pick<Facility, "id" | "name"> | null;
  _count?: { correctiveActions?: number };
};

export type CorrectiveAction = {
  id: string;
  complaintId?: string | null;
  inspectionId?: string | null;
  workOrderId?: string | null;
  status: string;
  title: string;
  description?: string | null;
  dueAt?: string | null;
  completedAt?: string | null;
  complaint?: Pick<Complaint, "id" | "title" | "status"> | null;
};

export type Incident = {
  id: string;
  customerId?: string | null;
  facilityId?: string | null;
  type: string;
  severity: string;
  status: string;
  title: string;
  description: string;
  occurredAt?: string | null;
  resolvedAt?: string | null;
  customer?: Pick<Customer, "id" | "name"> | null;
  facility?: Pick<Facility, "id" | "name"> | null;
};

export const issuesApi = {
  listComplaints: (query?: Query) =>
    workspaceRequest<ListResponse<Complaint>>(withQuery("/complaints", query)),
  createComplaint: (input: Record<string, unknown>) =>
    workspaceRequest<Complaint>("/complaints", { method: "POST", body: jsonBody(input) }),
  getComplaint: (id: string) => workspaceRequest<Complaint>(`/complaints/${id}`),
  updateComplaint: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<Complaint>(`/complaints/${id}`, { method: "PATCH", body: jsonBody(input) }),
  updateComplaintStatus: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<Complaint>(`/complaints/${id}/status`, {
      method: "PATCH",
      body: jsonBody(input),
    }),

  listCorrectiveActions: (query?: Query) =>
    workspaceRequest<ListResponse<CorrectiveAction>>(withQuery("/corrective-actions", query)),
  createCorrectiveAction: (input: Record<string, unknown>) =>
    workspaceRequest<CorrectiveAction>("/corrective-actions", {
      method: "POST",
      body: jsonBody(input),
    }),
  updateCorrectiveAction: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<CorrectiveAction>(`/corrective-actions/${id}`, {
      method: "PATCH",
      body: jsonBody(input),
    }),

  listIncidents: (query?: Query) =>
    workspaceRequest<ListResponse<Incident>>(withQuery("/incidents", query)),
  createIncident: (input: Record<string, unknown>) =>
    workspaceRequest<Incident>("/incidents", { method: "POST", body: jsonBody(input) }),
  getIncident: (id: string) => workspaceRequest<Incident>(`/incidents/${id}`),
  updateIncident: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<Incident>(`/incidents/${id}`, { method: "PATCH", body: jsonBody(input) }),
};
