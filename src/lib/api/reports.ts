import { Invoice } from "./billing";
import { ServiceRequest, WorkOrder } from "./operations";
import { ListResponse, Query, withQuery, workspaceRequest } from "./workspace-request";

export type ReportResponse<T> = ListResponse<T> & {
  summary: Record<string, unknown>;
};

export const reportsApi = {
  serviceRequests: (query?: Query) =>
    workspaceRequest<ReportResponse<ServiceRequest>>(withQuery("/reports/service-requests", query)),
  workOrders: (query?: Query) =>
    workspaceRequest<ReportResponse<WorkOrder>>(withQuery("/reports/work-orders", query)),
  invoices: (query?: Query) =>
    workspaceRequest<ReportResponse<Invoice>>(withQuery("/reports/invoices", query)),
};
