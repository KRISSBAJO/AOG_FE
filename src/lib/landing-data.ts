export type Module = {
  name: string;
  description: string;
};

export const coreModules: Module[] = [
  {
    name: "Contract Management",
    description:
      "SLAs, KPIs, pricing, renewals, compliance documents, and approval workflows for every cleaning, security, parking, and event contract.",
  },
  {
    name: "Facility Management",
    description:
      "Model every building, floor, zone, and asset a customer owns — hospitals, warehouses, malls, airports, and more.",
  },
  {
    name: "Cleaning Operations",
    description:
      "Recurring and one-time jobs, QA checklists, GPS check-in/out, before/after photos, and customer sign-off.",
  },
  {
    name: "Security Management",
    description:
      "Guard tours, patrol routes, incident reports, visitor logs, access control, and daily occurrence books.",
  },
  {
    name: "Parking Operations",
    description:
      "Lots, permits, reservations, violation tickets, occupancy tracking, and revenue reporting in one place.",
  },
  {
    name: "Event Setup",
    description:
      "Staffing, floor plans, equipment, teardown, and customer approval for every event booking.",
  },
  {
    name: "Staff Management",
    description:
      "Certifications, availability, attendance, performance, and payroll integration for the entire field workforce.",
  },
  {
    name: "Scheduling & Dispatch",
    description:
      "Drag-and-drop calendars, conflict detection, live GPS dispatch, and automatic replacement staffing.",
  },
  {
    name: "Finance & Billing",
    description:
      "Recurring invoices, expenses, purchase orders, and revenue-by-contract reporting tied directly to operations.",
  },
];

export type Role = {
  name: string;
  detail: string;
};

export const roleGroups: { title: string; roles: Role[] }[] = [
  {
    title: "Leadership & operations",
    roles: [
      { name: "Super Admin", detail: "Platform-wide configuration and oversight" },
      { name: "Regional Manager", detail: "Multi-facility performance and P&L" },
      { name: "Operations Director", detail: "Cross-service delivery standards" },
      { name: "Operations Manager", detail: "Day-to-day service execution" },
    ],
  },
  {
    title: "Service supervisors",
    roles: [
      { name: "Cleaning Supervisor", detail: "Job quality and crew oversight" },
      { name: "Security Supervisor", detail: "Guard shifts and incident response" },
      { name: "Parking Supervisor", detail: "Lot operations and enforcement" },
      { name: "Event Coordinator", detail: "Setup, staffing, and teardown" },
    ],
  },
  {
    title: "Customer & field",
    roles: [
      { name: "Facility Representative", detail: "Requests, approvals, and reporting" },
      { name: "Cleaner / Guard / Attendant", detail: "Mobile-first daily task execution" },
      { name: "Inspector / Auditor", detail: "Quality assurance and compliance" },
      { name: "Dispatcher", detail: "Live task assignment and escalation" },
    ],
  },
];

export const industries = [
  "Hospitals",
  "Warehouses",
  "Office Towers",
  "Shopping Malls",
  "Airports",
  "Hotels",
  "Schools",
  "Apartments",
  "Places of Worship",
];

export const aiHighlights = [
  "Predict staffing shortages before they happen",
  "Forecast inventory needs by facility and season",
  "Flag SLA and contract risk automatically",
  "Auto-generate quotations and inspection summaries",
];

export const workflowHighlights = [
  "Multi-level approvals for budgets, leave, and purchases",
  "Contract, invoice, and expense approval chains",
  "Customer and staff onboarding workflows",
  "Drag-and-drop custom workflow builder",
];

export const integrations = [
  "Payroll",
  "QuickBooks / Xero",
  "SSO",
  "GPS Providers",
  "Payment Gateways",
  "CCTV & Access Control",
  "IoT Sensors",
  "BI & Analytics",
];
