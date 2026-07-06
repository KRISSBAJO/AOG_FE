import { Customer, Facility, Service } from "@/lib/phase3-api";
import { jsonBody, ListResponse, Query, withQuery, workspaceRequest } from "./workspace-request";

export type ServiceRequest = {
  id: string;
  requestNumber: string;
  customerId: string;
  facilityId?: string | null;
  title: string;
  serviceLine: string;
  priority: string;
  status: string;
  requestedStartAt?: string | null;
  estimatedAmount?: string | null;
  customer?: Pick<Customer, "id" | "name" | "status">;
  facility?: Pick<Facility, "id" | "name" | "status"> | null;
  _count?: { items?: number; workOrders?: number };
};

export type WorkOrder = {
  id: string;
  workOrderNumber: string;
  customerId: string;
  facilityId?: string | null;
  title: string;
  serviceLine: string;
  priority: string;
  status: string;
  scheduledStartAt?: string | null;
  scheduledEndAt?: string | null;
  qaRequired: boolean;
  qaPassed?: boolean | null;
  customer?: Pick<Customer, "id" | "name">;
  facility?: Pick<Facility, "id" | "name"> | null;
  _count?: { tasks?: number; assignments?: number; photos?: number };
};

export const operationsApi = {
  listServiceRequests: (query?: Query) =>
    workspaceRequest<ListResponse<ServiceRequest>>(withQuery("/service-requests", query)),
  createServiceRequest: (input: Record<string, unknown>) =>
    workspaceRequest<ServiceRequest>("/service-requests", {
      method: "POST",
      body: jsonBody(input),
    }),
  addServiceRequestItem: (id: string, input: Record<string, unknown>) =>
    workspaceRequest(`/service-requests/${id}/items`, {
      method: "POST",
      body: jsonBody(input),
    }),
  approveServiceRequest: (id: string) =>
    workspaceRequest<ServiceRequest>(`/service-requests/${id}/approve`, { method: "POST" }),
  rejectServiceRequest: (id: string) =>
    workspaceRequest<ServiceRequest>(`/service-requests/${id}/reject`, { method: "POST" }),
  convertServiceRequest: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<WorkOrder>(`/service-requests/${id}/convert-to-work-order`, {
      method: "POST",
      body: jsonBody(input),
    }),

  listWorkOrders: (query?: Query) =>
    workspaceRequest<ListResponse<WorkOrder>>(withQuery("/work-orders", query)),
  createWorkOrder: (input: Record<string, unknown>) =>
    workspaceRequest<WorkOrder>("/work-orders", {
      method: "POST",
      body: jsonBody(input),
    }),
  updateWorkOrderStatus: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<WorkOrder>(`/work-orders/${id}/status`, {
      method: "PATCH",
      body: jsonBody(input),
    }),
  addWorkOrderTask: (id: string, input: Record<string, unknown>) =>
    workspaceRequest(`/work-orders/${id}/tasks`, {
      method: "POST",
      body: jsonBody(input),
    }),
  addWorkOrderAssignment: (id: string, input: Record<string, unknown>) =>
    workspaceRequest(`/work-orders/${id}/assignments`, {
      method: "POST",
      body: jsonBody(input),
    }),
  addWorkOrderPhoto: (id: string, input: Record<string, unknown>) =>
    workspaceRequest(`/work-orders/${id}/photos`, {
      method: "POST",
      body: jsonBody(input),
    }),
  signoffWorkOrder: (id: string, input: Record<string, unknown>) =>
    workspaceRequest(`/work-orders/${id}/signoff`, {
      method: "POST",
      body: jsonBody(input),
    }),
};

export type { Service };
