import { Department, Employee } from "./workforce";
import { jsonBody, ListResponse, Query, withQuery, workspaceRequest } from "./workspace-request";

export type Shift = {
  id: string;
  facilityId?: string | null;
  departmentId?: string | null;
  workOrderId?: string | null;
  serviceLine: string;
  title: string;
  status: string;
  startAt: string;
  endAt: string;
  requiredStaffCount: number;
  department?: Pick<Department, "id" | "name"> | null;
  assignments?: Array<{ id: string; employee?: Pick<Employee, "id" | "firstName" | "lastName"> }>;
};

export type Attendance = {
  id: string;
  employeeId: string;
  date: string;
  clockInAt?: string | null;
  clockOutAt?: string | null;
  status: string;
  employee?: Pick<Employee, "id" | "firstName" | "lastName">;
};

export type LeaveRequest = {
  id: string;
  employeeId: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  reason?: string | null;
  employee?: Pick<Employee, "id" | "firstName" | "lastName">;
};

export const schedulingApi = {
  listShifts: (query?: Query) => workspaceRequest<ListResponse<Shift>>(withQuery("/shifts", query)),
  createShift: (input: Record<string, unknown>) =>
    workspaceRequest<Shift>("/shifts", { method: "POST", body: jsonBody(input) }),
  updateShiftStatus: (id: string, status: string) =>
    workspaceRequest<Shift>(`/shifts/${id}/status`, {
      method: "PATCH",
      body: jsonBody({ status }),
    }),
  addShiftAssignment: (id: string, input: Record<string, unknown>) =>
    workspaceRequest(`/shifts/${id}/assignments`, { method: "POST", body: jsonBody(input) }),
  listAttendance: (query?: Query) =>
    workspaceRequest<ListResponse<Attendance>>(withQuery("/attendance", query)),
  createAttendance: (input: Record<string, unknown>) =>
    workspaceRequest<Attendance>("/attendance", { method: "POST", body: jsonBody(input) }),
  listLeaveRequests: (query?: Query) =>
    workspaceRequest<ListResponse<LeaveRequest>>(withQuery("/leave-requests", query)),
  createLeaveRequest: (input: Record<string, unknown>) =>
    workspaceRequest<LeaveRequest>("/leave-requests", { method: "POST", body: jsonBody(input) }),
  approveLeaveRequest: (id: string, reviewNote?: string) =>
    workspaceRequest<LeaveRequest>(`/leave-requests/${id}/approve`, {
      method: "PATCH",
      body: jsonBody({ reviewNote }),
    }),
  rejectLeaveRequest: (id: string, reviewNote?: string) =>
    workspaceRequest<LeaveRequest>(`/leave-requests/${id}/reject`, {
      method: "PATCH",
      body: jsonBody({ reviewNote }),
    }),
};
