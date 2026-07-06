import { apiRequest } from "./api";

export type ContactRequest = {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  facilityCount?: string;
  services?: string[];
  message: string;
};

export type ContactResponse = {
  message: string;
  id?: string;
};

/** Submits a sales/demo lead. Backend endpoint: POST /leads. */
export function submitContactRequest(input: ContactRequest) {
  return apiRequest<ContactResponse>("/leads", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
