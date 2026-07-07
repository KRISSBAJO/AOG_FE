import { jsonBody, ListResponse, Query, withQuery, workspaceRequest } from "./workspace-request";

export type Department = {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  _count?: { employees?: number; positions?: number; shifts?: number };
};

export type Position = {
  id: string;
  departmentId?: string | null;
  title: string;
  isActive: boolean;
  department?: Pick<Department, "id" | "name"> | null;
};

export type Skill = {
  id: string;
  name: string;
  serviceLine?: string | null;
};

export type Certification = Skill & {
  expires: boolean;
};

export type Employee = {
  id: string;
  userId?: string | null;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  employmentType: string;
  serviceLines: string[];
  department?: Pick<Department, "id" | "name" | "type"> | null;
  position?: Pick<Position, "id" | "title"> | null;
  _count?: { skills?: number; certifications?: number; shiftAssignments?: number };
};

export const workforceApi = {
  listDepartments: (query?: Query) =>
    workspaceRequest<ListResponse<Department>>(withQuery("/departments", query)),
  createDepartment: (input: Record<string, unknown>) =>
    workspaceRequest<Department>("/departments", { method: "POST", body: jsonBody(input) }),
  listPositions: () => workspaceRequest<Position[]>("/positions"),
  createPosition: (input: Record<string, unknown>) =>
    workspaceRequest<Position>("/positions", { method: "POST", body: jsonBody(input) }),
  listSkills: () => workspaceRequest<Skill[]>("/skills"),
  createSkill: (input: Record<string, unknown>) =>
    workspaceRequest<Skill>("/skills", { method: "POST", body: jsonBody(input) }),
  listCertifications: () => workspaceRequest<Certification[]>("/certifications"),
  createCertification: (input: Record<string, unknown>) =>
    workspaceRequest<Certification>("/certifications", { method: "POST", body: jsonBody(input) }),
  listEmployees: (query?: Query) =>
    workspaceRequest<ListResponse<Employee>>(withQuery("/employees", query)),
  createEmployee: (input: Record<string, unknown>) =>
    workspaceRequest<Employee>("/employees", { method: "POST", body: jsonBody(input) }),
  inviteEmployee: (employeeId: string) =>
    workspaceRequest<{ email: string; displayName: string; role: string; inviteUrl: string; token?: string }>(
      `/employees/${employeeId}/invite`,
      { method: "POST", body: jsonBody({}) },
    ),
  assignSkill: (employeeId: string, input: Record<string, unknown>) =>
    workspaceRequest(`/employees/${employeeId}/skills`, { method: "POST", body: jsonBody(input) }),
  assignCertification: (employeeId: string, input: Record<string, unknown>) =>
    workspaceRequest(`/employees/${employeeId}/certifications`, {
      method: "POST",
      body: jsonBody(input),
    }),
};
