import { ApiError, apiRequest } from "./api";
import { getActiveWorkspaceId } from "./auth";

type QueryValue = string | number | boolean | null | undefined;
type Query = Record<string, QueryValue>;

export type ListResponse<T> = {
  data: T[];
  meta: {
    skip: number;
    take: number;
    total: number;
  };
};

export type Customer = {
  id: string;
  code?: string | null;
  name: string;
  type: string;
  status: string;
  billingEmail?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  _count?: {
    contacts?: number;
    facilities?: number;
    contracts?: number;
  };
};

export type CustomerContact = {
  id: string;
  customerId: string;
  userId?: string | null;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  title?: string | null;
  role: string;
  isPrimary: boolean;
  canLogin?: boolean;
};

export type Facility = {
  id: string;
  customerId: string;
  code?: string | null;
  name: string;
  type: string;
  status: string;
  city?: string | null;
  state?: string | null;
  customer?: Pick<Customer, "id" | "name" | "status">;
  _count?: {
    contacts?: number;
    contractFacilities?: number;
    workOrders?: number;
  };
};

export type FacilityContact = {
  id: string;
  facilityId: string;
  customerContactId?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  isPrimary: boolean;
};

export type InviteResponse = {
  email: string;
  displayName: string;
  role: string;
  inviteUrl: string;
  expiresAt: string;
  token?: string;
  target: string;
};

export type ServiceCategory = {
  id: string;
  name: string;
  description?: string | null;
  serviceLine: string;
  isActive: boolean;
  sortOrder: number;
  _count?: { services?: number };
};

export type Service = {
  id: string;
  categoryId?: string | null;
  code?: string | null;
  name: string;
  description?: string | null;
  serviceLine: string;
  defaultUnit: string;
  basePrice?: string | null;
  estimatedDurationMinutes?: number | null;
  requiresInspection: boolean;
  isBookableOnline: boolean;
  isActive: boolean;
  category?: Pick<ServiceCategory, "id" | "name" | "serviceLine"> | null;
  _count?: {
    prices?: number;
    requirements?: number;
    contractServices?: number;
  };
};

export type ServicePrice = {
  id: string;
  serviceId: string;
  name: string;
  unit: string;
  amount: string;
  currency: string;
  isDefault: boolean;
  isActive: boolean;
};

export type ServiceRequirement = {
  id: string;
  serviceId: string;
  name: string;
  description?: string | null;
  isMandatory: boolean;
};

export type ServiceArea = {
  id: string;
  name: string;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  isActive: boolean;
};

export type Contract = {
  id: string;
  customerId: string;
  contractNumber: string;
  title: string;
  status: string;
  startDate: string;
  endDate?: string | null;
  billingFrequency: string;
  totalValue?: string | null;
  currency: string;
  customer?: Pick<Customer, "id" | "name" | "status">;
  _count?: {
    facilities?: number;
    services?: number;
    schedules?: number;
  };
};

export type ContractService = {
  id: string;
  contractId: string;
  serviceId?: string | null;
  serviceLine: string;
  name: string;
  frequency: string;
  quantity: string;
  unit: string;
  price?: string | null;
  isActive: boolean;
};

export type ContractSchedule = {
  id: string;
  contractId: string;
  serviceLine: string;
  frequency: string;
  dayOfWeek?: number | null;
  dayOfMonth?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  timezone?: string | null;
  isActive: boolean;
};

function withQuery(path: string, query?: Query) {
  const params = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

function workspaceRequest<T>(path: string, init: RequestInit = {}) {
  const workspaceId = getActiveWorkspaceId();

  if (!workspaceId) {
    throw new ApiError(401, { message: "Sign in again to choose a workspace." });
  }

  const headers = new Headers(init.headers);
  headers.set("x-workspace-id", workspaceId);

  return apiRequest<T>(path, {
    ...init,
    headers,
  });
}

function jsonBody(input: unknown) {
  return JSON.stringify(input);
}

export const phase3Api = {
  listCustomers: (query?: Query) =>
    workspaceRequest<ListResponse<Customer>>(withQuery("/customers", query)),
  createCustomer: (input: Record<string, unknown>) =>
    workspaceRequest<Customer>("/customers", { method: "POST", body: jsonBody(input) }),
  getCustomer: (id: string) => workspaceRequest<Customer>(`/customers/${id}`),
  updateCustomer: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<Customer>(`/customers/${id}`, { method: "PATCH", body: jsonBody(input) }),
  archiveCustomer: (id: string) =>
    workspaceRequest<Customer>(`/customers/${id}`, { method: "DELETE" }),
  listCustomerContacts: (customerId: string) =>
    workspaceRequest<CustomerContact[]>(`/customers/${customerId}/contacts`),
  createCustomerContact: (customerId: string, input: Record<string, unknown>) =>
    workspaceRequest<CustomerContact>(`/customers/${customerId}/contacts`, {
      method: "POST",
      body: jsonBody(input),
    }),
  updateCustomerContact: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<CustomerContact>(`/customer-contacts/${id}`, {
      method: "PATCH",
      body: jsonBody(input),
    }),
  deleteCustomerContact: (id: string) =>
    workspaceRequest<CustomerContact>(`/customer-contacts/${id}`, { method: "DELETE" }),
  inviteCustomerContact: (id: string) =>
    workspaceRequest<InviteResponse>(`/customer-contacts/${id}/invite`, {
      method: "POST",
      body: jsonBody({}),
    }),

  listFacilities: (query?: Query) =>
    workspaceRequest<ListResponse<Facility>>(withQuery("/facilities", query)),
  createFacility: (input: Record<string, unknown>) =>
    workspaceRequest<Facility>("/facilities", { method: "POST", body: jsonBody(input) }),
  getFacility: (id: string) => workspaceRequest<Facility>(`/facilities/${id}`),
  updateFacility: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<Facility>(`/facilities/${id}`, { method: "PATCH", body: jsonBody(input) }),
  archiveFacility: (id: string) =>
    workspaceRequest<Facility>(`/facilities/${id}`, { method: "DELETE" }),
  listFacilityContacts: (facilityId: string) =>
    workspaceRequest<FacilityContact[]>(`/facilities/${facilityId}/contacts`),
  createFacilityContact: (facilityId: string, input: Record<string, unknown>) =>
    workspaceRequest<FacilityContact>(`/facilities/${facilityId}/contacts`, {
      method: "POST",
      body: jsonBody(input),
    }),
  updateFacilityContact: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<FacilityContact>(`/facility-contacts/${id}`, {
      method: "PATCH",
      body: jsonBody(input),
    }),
  deleteFacilityContact: (id: string) =>
    workspaceRequest<FacilityContact>(`/facility-contacts/${id}`, { method: "DELETE" }),
  inviteFacilityContact: (id: string) =>
    workspaceRequest<InviteResponse>(`/facility-contacts/${id}/invite`, {
      method: "POST",
      body: jsonBody({}),
    }),

  listServiceCategories: (query?: Query) =>
    workspaceRequest<ListResponse<ServiceCategory>>(withQuery("/service-categories", query)),
  createServiceCategory: (input: Record<string, unknown>) =>
    workspaceRequest<ServiceCategory>("/service-categories", {
      method: "POST",
      body: jsonBody(input),
    }),
  getServiceCategory: (id: string) => workspaceRequest<ServiceCategory>(`/service-categories/${id}`),
  updateServiceCategory: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<ServiceCategory>(`/service-categories/${id}`, {
      method: "PATCH",
      body: jsonBody(input),
    }),
  deactivateServiceCategory: (id: string) =>
    workspaceRequest<ServiceCategory>(`/service-categories/${id}`, { method: "DELETE" }),
  listServices: (query?: Query) =>
    workspaceRequest<ListResponse<Service>>(withQuery("/services", query)),
  createService: (input: Record<string, unknown>) =>
    workspaceRequest<Service>("/services", { method: "POST", body: jsonBody(input) }),
  getService: (id: string) => workspaceRequest<Service>(`/services/${id}`),
  updateService: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<Service>(`/services/${id}`, { method: "PATCH", body: jsonBody(input) }),
  deactivateService: (id: string) =>
    workspaceRequest<Service>(`/services/${id}`, { method: "DELETE" }),
  listServicePrices: (serviceId: string) =>
    workspaceRequest<ServicePrice[]>(`/services/${serviceId}/prices`),
  createServicePrice: (serviceId: string, input: Record<string, unknown>) =>
    workspaceRequest<ServicePrice>(`/services/${serviceId}/prices`, {
      method: "POST",
      body: jsonBody(input),
    }),
  updateServicePrice: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<ServicePrice>(`/service-prices/${id}`, {
      method: "PATCH",
      body: jsonBody(input),
    }),
  deactivateServicePrice: (id: string) =>
    workspaceRequest<ServicePrice>(`/service-prices/${id}`, { method: "DELETE" }),
  listServiceRequirements: (serviceId: string) =>
    workspaceRequest<ServiceRequirement[]>(`/services/${serviceId}/requirements`),
  createServiceRequirement: (serviceId: string, input: Record<string, unknown>) =>
    workspaceRequest<ServiceRequirement>(`/services/${serviceId}/requirements`, {
      method: "POST",
      body: jsonBody(input),
    }),
  updateServiceRequirement: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<ServiceRequirement>(`/service-requirements/${id}`, {
      method: "PATCH",
      body: jsonBody(input),
    }),
  deleteServiceRequirement: (id: string) =>
    workspaceRequest<ServiceRequirement>(`/service-requirements/${id}`, { method: "DELETE" }),
  listServiceAreas: (query?: Query) =>
    workspaceRequest<ListResponse<ServiceArea>>(withQuery("/service-areas", query)),
  createServiceArea: (input: Record<string, unknown>) =>
    workspaceRequest<ServiceArea>("/service-areas", { method: "POST", body: jsonBody(input) }),
  updateServiceArea: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<ServiceArea>(`/service-areas/${id}`, { method: "PATCH", body: jsonBody(input) }),
  deactivateServiceArea: (id: string) =>
    workspaceRequest<ServiceArea>(`/service-areas/${id}`, { method: "DELETE" }),

  listContracts: (query?: Query) =>
    workspaceRequest<ListResponse<Contract>>(withQuery("/contracts", query)),
  createContract: (input: Record<string, unknown>) =>
    workspaceRequest<Contract>("/contracts", { method: "POST", body: jsonBody(input) }),
  getContract: (id: string) => workspaceRequest<Contract>(`/contracts/${id}`),
  updateContract: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<Contract>(`/contracts/${id}`, { method: "PATCH", body: jsonBody(input) }),
  updateContractStatus: (id: string, status: string) =>
    workspaceRequest<Contract>(`/contracts/${id}/status`, {
      method: "PATCH",
      body: jsonBody({ status }),
    }),
  terminateContract: (id: string) =>
    workspaceRequest<Contract>(`/contracts/${id}`, { method: "DELETE" }),
  addContractFacility: (id: string, facilityId: string) =>
    workspaceRequest(`/contracts/${id}/facilities`, {
      method: "POST",
      body: jsonBody({ facilityId }),
    }),
  removeContractFacility: (id: string, facilityId: string) =>
    workspaceRequest(`/contracts/${id}/facilities/${facilityId}`, { method: "DELETE" }),
  listContractServices: (id: string) =>
    workspaceRequest<ContractService[]>(`/contracts/${id}/services`),
  createContractService: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<ContractService>(`/contracts/${id}/services`, {
      method: "POST",
      body: jsonBody(input),
    }),
  updateContractService: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<ContractService>(`/contracts/services/${id}`, {
      method: "PATCH",
      body: jsonBody(input),
    }),
  deactivateContractService: (id: string) =>
    workspaceRequest<ContractService>(`/contracts/services/${id}`, { method: "DELETE" }),
  listContractSchedules: (id: string) =>
    workspaceRequest<ContractSchedule[]>(`/contracts/${id}/schedules`),
  createContractSchedule: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<ContractSchedule>(`/contracts/${id}/schedules`, {
      method: "POST",
      body: jsonBody(input),
    }),
  updateContractSchedule: (id: string, input: Record<string, unknown>) =>
    workspaceRequest<ContractSchedule>(`/contracts/schedules/${id}`, {
      method: "PATCH",
      body: jsonBody(input),
    }),
  deactivateContractSchedule: (id: string) =>
    workspaceRequest<ContractSchedule>(`/contracts/schedules/${id}`, { method: "DELETE" }),
};
