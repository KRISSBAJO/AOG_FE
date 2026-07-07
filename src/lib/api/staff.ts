import {
  jsonBody,
  withQuery,
  workspaceRequest,
  type Query,
} from "./workspace-request";

export type StaffWorkOrderAssignment = {
  id: string;
  workOrder: {
    id: string;
    workOrderNumber: string;
    title: string;
    status: string;
    scheduledStartAt?: string | null;
    scheduledEndAt?: string | null;
    customer?: { id: string; name: string };
    facility?: { id: string; name: string } | null;
  };
};

export type StaffShiftAssignment = {
  id: string;
  shift: {
    id: string;
    title: string;
    status: string;
    startAt: string;
    endAt: string;
    workOrderId?: string | null;
    facility?: { id: string; name: string } | null;
  };
};

export type StaffEmployee = {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  status: string;
  hourlyRate?: string | number | null;
  department?: { id: string; name: string; type: string } | null;
  position?: { id: string; title: string } | null;
  workOrderAssignments: StaffWorkOrderAssignment[];
  shiftAssignments: StaffShiftAssignment[];
};

export type StaffAttendance = {
  id: string;
  employeeId: string;
  shiftId?: string | null;
  workOrderId?: string | null;
  date: string;
  clockInAt?: string | null;
  clockOutAt?: string | null;
  status: string;
  notes?: string | null;
  shift?: { id: string; title: string; startAt: string; endAt: string } | null;
  workOrder?: {
    id: string;
    workOrderNumber: string;
    title: string;
    status: string;
  } | null;
};

export type StaffMe = {
  employee: StaffEmployee;
  activeAttendance?: StaffAttendance | null;
  todayAttendance: StaffAttendance[];
  payPeriod: { from: string; to: string };
};

export type ClockOutResponse = {
  attendance: StaffAttendance;
  proofPhotosCreated: number;
};

export type PayrollSummary = {
  period: { from: string; to: string; payPeriodDays: number };
  totals: {
    employees: number;
    hours: number;
    grossPay: number;
    openRecords: number;
  };
  employees: Array<{
    employee: {
      id: string;
      employeeNumber: string;
      firstName: string;
      lastName: string;
      hourlyRate?: string | number | null;
      department?: { id: string; name: string } | null;
      position?: { id: string; title: string } | null;
    };
    hours: number;
    hourlyRate: number;
    grossPay: number;
    openRecords: number;
    records: StaffAttendance[];
  }>;
};

export const staffApi = {
  me: () => workspaceRequest<StaffMe>("/staff/me"),
  clockIn: (input: Record<string, unknown>) =>
    workspaceRequest<StaffAttendance>("/staff/clock-in", {
      method: "POST",
      body: jsonBody(input),
    }),
  clockOut: (input: Record<string, unknown>) =>
    workspaceRequest<ClockOutResponse>("/staff/clock-out", {
      method: "POST",
      body: jsonBody(input),
    }),
};

export const payrollApi = {
  summary: (query?: Query) =>
    workspaceRequest<PayrollSummary>(withQuery("/payroll/summary", query)),
};
