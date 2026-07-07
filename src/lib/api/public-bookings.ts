import { apiRequest } from "../api";

export type PublicServiceLine =
  | "CLEANING"
  | "SECURITY"
  | "PARKING"
  | "EVENT_SETUP"
  | "FACILITY_SUPPORT"
  | "OTHER";

export type CreatePublicBookingInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  serviceLine: PublicServiceLine;
  serviceType?: string;
  facilityName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  requestedStartAt?: string;
  preferredTimeWindow?: string;
  message: string;
};

export type PublicBookingCreated = {
  orderNumber: string;
  status: string;
  statusCode: string;
  message: string;
  requestedStartAt?: string | null;
  createdAt: string;
  statusUrl?: string;
};

export type PublicBookingStatus = {
  orderNumber: string;
  status: string;
  statusCode: string;
  nextStep: string;
  serviceLine: PublicServiceLine;
  title: string;
  requestedStartAt?: string | null;
  preferredTimeWindow?: string | null;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  facility: {
    name: string;
    city?: string | null;
    state?: string | null;
  } | null;
  workOrders: Array<{
    workOrderNumber: string;
    status: string;
  }>;
  timeline: Array<{
    status: string;
    statusCode: string;
    note?: string | null;
    at: string;
  }>;
};

export type LookupPublicBookingInput = {
  orderNumber: string;
  lastName: string;
  emailOrPhone: string;
};

export function createPublicServiceBooking(input: CreatePublicBookingInput) {
  return apiRequest<PublicBookingCreated>("/public/service-bookings", {
    method: "POST",
    body: JSON.stringify(input),
    skipAuthRefresh: true,
  });
}

export function lookupPublicServiceBooking(input: LookupPublicBookingInput) {
  return apiRequest<PublicBookingStatus>("/public/service-bookings/status", {
    method: "POST",
    body: JSON.stringify(input),
    skipAuthRefresh: true,
  });
}
