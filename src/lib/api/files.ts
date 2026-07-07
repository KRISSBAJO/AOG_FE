import { jsonBody, ListResponse, Query, withQuery, workspaceRequest } from "./workspace-request";

export type Attachment = {
  id: string;
  entityType: string;
  entityId: string;
  documentType: string;
  url: string;
  fileName: string;
  mimeType?: string | null;
  sizeBytes?: string | null;
  description?: string | null;
  createdAt: string;
  uploadedBy?: { id: string; displayName: string; email: string } | null;
};

export type Comment = {
  id: string;
  entityType: string;
  entityId: string;
  body: string;
  internalOnly: boolean;
  createdAt: string;
  author?: { id: string; displayName: string; email: string } | null;
};

export type StorageTargets = {
  directUrl: boolean;
  s3: { configured: boolean; bucket: string | null; region: string | null };
  cloudinary: { configured: boolean; cloudName: string | null };
};

export const filesApi = {
  getStorageTargets: () => workspaceRequest<StorageTargets>("/attachments/storage-targets"),
  listAttachments: (query?: Query) =>
    workspaceRequest<ListResponse<Attachment>>(withQuery("/attachments", query)),
  createAttachment: (input: Record<string, unknown>) =>
    workspaceRequest<Attachment>("/attachments", { method: "POST", body: jsonBody(input) }),
  getAttachment: (id: string) => workspaceRequest<Attachment>(`/attachments/${id}`),
  deleteAttachment: (id: string) =>
    workspaceRequest<{ deleted: boolean }>(`/attachments/${id}`, { method: "DELETE" }),
  listComments: (query?: Query) =>
    workspaceRequest<ListResponse<Comment>>(withQuery("/comments", query)),
  createComment: (input: Record<string, unknown>) =>
    workspaceRequest<Comment>("/comments", { method: "POST", body: jsonBody(input) }),
  updateComment: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<Comment>(`/comments/${id}`, { method: "PATCH", body: jsonBody(input) }),
  deleteComment: (id: string) =>
    workspaceRequest<{ deleted: boolean }>(`/comments/${id}`, { method: "DELETE" }),
};
