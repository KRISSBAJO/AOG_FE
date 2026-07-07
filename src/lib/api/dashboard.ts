import { WorkOrder } from "./operations";
import { Query, withQuery, workspaceRequest } from "./workspace-request";

export type DashboardOverview = {
  kpis: {
    customers: number;
    facilities: number;
    openServiceRequests: number;
    activeWorkOrders: number;
    failedInspections: number;
    openComplaints: number;
    openIncidents: number;
    overdueInvoices: number;
    revenue: string | number;
  };
  recentWorkOrders: WorkOrder[];
  recentActivity: AuditActivity[];
};

export type AuditActivity = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  createdAt: string;
  actor?: { id: string; displayName: string; email: string } | null;
};

export type GroupCount = {
  _count: { _all: number };
  [key: string]: unknown;
};

export type DashboardWorkOrders = {
  byStatus: GroupCount[];
  byPriority: GroupCount[];
  upcoming: WorkOrder[];
  overdue: WorkOrder[];
};

export type DashboardRevenue = {
  monthly: Array<{ month: string; amount: number }>;
  openInvoices: { _sum: { balanceDue?: string | number | null }; _count: { _all: number } };
  overdueInvoices: { _sum: { balanceDue?: string | number | null }; _count: { _all: number } };
};

export const dashboardApi = {
  overview: (query?: Query) =>
    workspaceRequest<DashboardOverview>(withQuery("/dashboard/overview", query)),
  workOrders: (query?: Query) =>
    workspaceRequest<DashboardWorkOrders>(withQuery("/dashboard/work-orders", query)),
  revenue: (query?: Query) =>
    workspaceRequest<DashboardRevenue>(withQuery("/dashboard/revenue", query)),
};
