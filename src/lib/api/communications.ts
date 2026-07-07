import { Customer, Facility } from "@/lib/phase3-api";
import { jsonBody, ListResponse, Query, withQuery, workspaceRequest } from "./workspace-request";

export type Conversation = {
  id: string;
  type: string;
  customerId?: string | null;
  facilityId?: string | null;
  title?: string | null;
  isClosed: boolean;
  updatedAt: string;
  customer?: Pick<Customer, "id" | "name"> | null;
  facility?: Pick<Facility, "id" | "name"> | null;
  participants?: ConversationParticipant[];
  messages?: Message[];
  _count?: { messages?: number };
};

export type ConversationParticipant = {
  id: string;
  type: string;
  displayName: string;
  userId?: string | null;
  employeeId?: string | null;
  customerContactId?: string | null;
};

export type Message = {
  id: string;
  conversationId: string;
  senderName: string;
  body: string;
  visibility: string;
  createdAt: string;
  attachments?: MessageAttachment[];
};

export type MessageAttachment = {
  id: string;
  messageId: string;
  url: string;
  fileName: string;
  mimeType?: string | null;
};

export type Notification = {
  id: string;
  type: string;
  channel: string;
  status: string;
  title: string;
  body?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  createdAt: string;
};

export type NotificationListResponse = ListResponse<Notification> & {
  meta: ListResponse<Notification>["meta"] & { unread?: number };
};

export type DeliveryConfig = {
  inApp: boolean;
  emailConfigured: boolean;
  smsConfigured: boolean;
  pushConfigured: boolean;
};

export const communicationsApi = {
  listConversations: (query?: Query) =>
    workspaceRequest<ListResponse<Conversation>>(withQuery("/conversations", query)),
  createConversation: (input: Record<string, unknown>) =>
    workspaceRequest<Conversation>("/conversations", {
      method: "POST",
      body: jsonBody(input),
    }),
  getConversation: (id: string) => workspaceRequest<Conversation>(`/conversations/${id}`),
  updateConversation: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<Conversation>(`/conversations/${id}`, {
      method: "PATCH",
      body: jsonBody(input),
    }),
  addParticipant: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<ConversationParticipant>(`/conversations/${id}/participants`, {
      method: "POST",
      body: jsonBody(input),
    }),
  listMessages: (id: string, query?: Query) =>
    workspaceRequest<ListResponse<Message>>(withQuery(`/conversations/${id}/messages`, query)),
  addMessage: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<Message>(`/conversations/${id}/messages`, {
      method: "POST",
      body: jsonBody(input),
    }),
  addMessageAttachment: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<MessageAttachment>(`/messages/${id}/attachments`, {
      method: "POST",
      body: jsonBody(input),
    }),
  listNotifications: (query?: Query) =>
    workspaceRequest<NotificationListResponse>(withQuery("/notifications", query)),
  createNotification: (input: Record<string, unknown>) =>
    workspaceRequest<Notification>("/notifications", {
      method: "POST",
      body: jsonBody(input),
    }),
  readNotification: (id: string) =>
    workspaceRequest<Notification>(`/notifications/${id}/read`, { method: "PATCH" }),
  readAllNotifications: () =>
    workspaceRequest<{ updated: number }>("/notifications/read-all", { method: "PATCH" }),
  getDeliveryConfig: () => workspaceRequest<DeliveryConfig>("/notifications/delivery-config"),
};
