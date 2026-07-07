import { Customer, Service } from "@/lib/phase3-api";
import { WorkOrder } from "./operations";
import { jsonBody, ListResponse, Query, withQuery, workspaceRequest } from "./workspace-request";

export type Invoice = {
  id: string;
  customerId: string;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate?: string | null;
  currency: string;
  subtotal: string;
  taxTotal: string;
  total: string;
  amountPaid: string;
  balanceDue: string;
  customer?: Pick<Customer, "id" | "name">;
  items?: InvoiceItem[];
  payments?: Payment[];
  _count?: { items?: number; payments?: number };
};

export type InvoiceItem = {
  id: string;
  invoiceId: string;
  workOrderId?: string | null;
  serviceId?: string | null;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  taxRate?: string | null;
  lineTotal: string;
  workOrder?: Pick<WorkOrder, "id" | "workOrderNumber" | "title"> | null;
  service?: Pick<Service, "id" | "name"> | null;
};

export type Payment = {
  id: string;
  customerId: string;
  invoiceId?: string | null;
  paymentNumber?: string | null;
  method: string;
  status: string;
  amount: string;
  currency: string;
  paidAt?: string | null;
  reference?: string | null;
  customer?: Pick<Customer, "id" | "name">;
  invoice?: Pick<Invoice, "id" | "invoiceNumber" | "status" | "balanceDue"> | null;
};

export const billingApi = {
  listInvoices: (query?: Query) =>
    workspaceRequest<ListResponse<Invoice>>(withQuery("/invoices", query)),
  createInvoice: (input: Record<string, unknown>) =>
    workspaceRequest<Invoice>("/invoices", { method: "POST", body: jsonBody(input) }),
  getInvoice: (id: string) => workspaceRequest<Invoice>(`/invoices/${id}`),
  updateInvoice: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<Invoice>(`/invoices/${id}`, { method: "PATCH", body: jsonBody(input) }),
  cancelInvoice: (id: string) => workspaceRequest<Invoice>(`/invoices/${id}`, { method: "DELETE" }),
  sendInvoice: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<Invoice>(`/invoices/${id}/send`, { method: "POST", body: jsonBody(input) }),
  addInvoiceItem: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<InvoiceItem>(`/invoices/${id}/items`, {
      method: "POST",
      body: jsonBody(input),
    }),
  updateInvoiceItem: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<InvoiceItem>(`/invoice-items/${id}`, {
      method: "PATCH",
      body: jsonBody(input),
    }),
  deleteInvoiceItem: (id: string) =>
    workspaceRequest<{ deleted: boolean }>(`/invoice-items/${id}`, { method: "DELETE" }),
  listPayments: (query?: Query) =>
    workspaceRequest<ListResponse<Payment>>(withQuery("/payments", query)),
  createPayment: (input: Record<string, unknown>) =>
    workspaceRequest<Payment>("/payments", { method: "POST", body: jsonBody(input) }),
  updatePayment: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<Payment>(`/payments/${id}`, { method: "PATCH", body: jsonBody(input) }),
  cancelPayment: (id: string) => workspaceRequest<Payment>(`/payments/${id}`, { method: "DELETE" }),
};
