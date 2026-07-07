import { jsonBody, ListResponse, Query, withQuery, workspaceRequest } from "./workspace-request";

export type InspectionTemplateItem = {
  id: string;
  templateId: string;
  question: string;
  instructions?: string | null;
  isRequired: boolean;
  sortOrder: number;
  weight?: string | null;
};

export type InspectionTemplate = {
  id: string;
  name: string;
  description?: string | null;
  serviceLine: string;
  isActive: boolean;
  items?: InspectionTemplateItem[];
  _count?: { inspections?: number };
};

export type Inspection = {
  id: string;
  templateId?: string | null;
  workOrderId?: string | null;
  serviceRequestId?: string | null;
  facilityId?: string | null;
  inspectorEmployeeId?: string | null;
  status: string;
  score?: string | null;
  passed?: boolean | null;
  notes?: string | null;
  createdAt: string;
  template?: Pick<InspectionTemplate, "id" | "name" | "serviceLine"> | null;
  workOrder?: { id: string; workOrderNumber: string; title: string } | null;
  facility?: { id: string; name: string } | null;
  itemResults?: InspectionResult[];
};

export type InspectionResult = {
  id: string;
  inspectionId: string;
  question: string;
  result: string;
  score?: string | null;
  notes?: string | null;
  photoUrl?: string | null;
};

export const qaApi = {
  listTemplates: (query?: Query) =>
    workspaceRequest<ListResponse<InspectionTemplate>>(withQuery("/inspection-templates", query)),
  createTemplate: (input: Record<string, unknown>) =>
    workspaceRequest<InspectionTemplate>("/inspection-templates", {
      method: "POST",
      body: jsonBody(input),
    }),
  updateTemplate: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<InspectionTemplate>(`/inspection-templates/${id}`, {
      method: "PATCH",
      body: jsonBody(input),
    }),
  deactivateTemplate: (id: string) =>
    workspaceRequest<InspectionTemplate>(`/inspection-templates/${id}`, { method: "DELETE" }),
  addTemplateItem: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<InspectionTemplateItem>(`/inspection-templates/${id}/items`, {
      method: "POST",
      body: jsonBody(input),
    }),
  listInspections: (query?: Query) =>
    workspaceRequest<ListResponse<Inspection>>(withQuery("/inspections", query)),
  createInspection: (input: Record<string, unknown>) =>
    workspaceRequest<Inspection>("/inspections", {
      method: "POST",
      body: jsonBody(input),
    }),
  addResult: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<InspectionResult>(`/inspections/${id}/results`, {
      method: "POST",
      body: jsonBody(input),
    }),
  completeInspection: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<Inspection>(`/inspections/${id}/complete`, {
      method: "PATCH",
      body: jsonBody(input),
    }),
};
