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

export type ServiceLine = {
  name: string;
  description: string;
  tags?: string[];
  featured?: boolean;
};

export const serviceLines: ServiceLine[] = [
  {
    name: "Commercial Cleaning",
    description:
      "Daily janitorial, deep cleans, and specialized sanitation with photo-verified quality checks on every completed task.",
    tags: ["Janitorial", "Deep clean", "Sanitation"],
    featured: true,
  },
  {
    name: "Security Staffing",
    description:
      "Licensed guards, patrol logs, and incident reporting with live shift coverage.",
  },
  {
    name: "Parking Management",
    description:
      "Attendants, capacity tracking, and access control across multiple lots.",
  },
  {
    name: "Event Venue Setup",
    description:
      "Staging, seating, teardown, and turnover crews scheduled to the minute.",
  },
  {
    name: "Facility Support",
    description:
      "Handyman, maintenance, and grounds support dispatched on demand.",
  },
];

export type ModuleGroup = {
  category: string;
  blurb: string;
  modules: { name: string; description: string }[];
};

/** The full AOG OS module catalogue, grouped by domain. */
export const moduleCatalog: ModuleGroup[] = [
  {
    category: "Sales & Customer",
    blurb: "Win the work and keep customers close.",
    modules: [
      {
        name: "Customer Portal",
        description:
          "Self-service booking, invoices, documents, and support in one place.",
      },
      {
        name: "CRM",
        description:
          "Leads, pipeline, quotes, and renewal tracking from first touch to signed contract.",
      },
      {
        name: "Contract Management",
        description:
          "SLAs, KPIs, pricing, renewals, and approval workflows for every service.",
      },
    ],
  },
  {
    category: "Field Operations",
    blurb: "Every service line, run to the same standard.",
    modules: [
      {
        name: "Facility Management",
        description:
          "Buildings, floors, zones, assets, and access instructions per site.",
      },
      {
        name: "Cleaning Operations",
        description:
          "Recurring and one-time jobs with QA checklists and photo sign-off.",
      },
      {
        name: "Security Management",
        description:
          "Guard tours, patrol routes, incident reports, and occurrence books.",
      },
      {
        name: "Parking Operations",
        description:
          "Permits, reservations, violations, and live occupancy tracking.",
      },
      {
        name: "Event Setup",
        description:
          "Staffing, floor plans, equipment, teardown, and customer approval.",
      },
    ],
  },
  {
    category: "Workforce",
    blurb: "Get the right people to the right site, on time.",
    modules: [
      {
        name: "Staff Management",
        description:
          "Records, certifications, availability, and performance reviews.",
      },
      {
        name: "Scheduling & Dispatch",
        description:
          "Drag-and-drop calendars, conflict detection, and live GPS dispatch.",
      },
      {
        name: "Time & Attendance",
        description:
          "GPS check-in/out, timesheets, and payroll-ready exports.",
      },
      {
        name: "Mobile Workforce",
        description:
          "Offline task lists, QR scans, digital forms, and SOS from the field.",
      },
    ],
  },
  {
    category: "Assets & Supply",
    blurb: "Keep equipment running and shelves stocked.",
    modules: [
      {
        name: "Inventory",
        description:
          "Chemicals, PPE, and consumables with stock levels and expiry tracking.",
      },
      {
        name: "Asset Management",
        description:
          "Machines, vehicles, and equipment with full maintenance history.",
      },
      {
        name: "Maintenance",
        description:
          "Preventive and corrective work orders tied to assets and contractors.",
      },
      {
        name: "Procurement",
        description:
          "Purchase requests, suppliers, and purchase-order approvals.",
      },
    ],
  },
  {
    category: "Quality & Compliance",
    blurb: "Prove the work and stay audit-ready.",
    modules: [
      {
        name: "Inspections & QA",
        description:
          "Audit forms, random inspections, defects, and corrective actions.",
      },
      {
        name: "Incident Management",
        description:
          "Report, escalate, and resolve incidents with photo evidence.",
      },
      {
        name: "Visitor Management",
        description:
          "Visitor logs, badges, and access control at every checkpoint.",
      },
    ],
  },
  {
    category: "Finance & Insight",
    blurb: "Turn operations into revenue and reporting.",
    modules: [
      {
        name: "Finance & Billing",
        description:
          "Recurring invoices, expenses, purchase orders, and revenue-by-contract.",
      },
      {
        name: "Reports & Dashboards",
        description:
          "Executive, operations, and SLA-compliance analytics in real time.",
      },
    ],
  },
  {
    category: "Platform",
    blurb: "The shared foundation under every module.",
    modules: [
      {
        name: "Workflow Engine",
        description:
          "Multi-level approvals and a drag-and-drop custom workflow builder.",
      },
      {
        name: "AI Assistant",
        description:
          "Staffing forecasts, SLA-risk detection, and auto-generated summaries.",
      },
      {
        name: "Communication Hub",
        description:
          "Chat, announcements, and facility ↔ AOG messaging in one thread.",
      },
      {
        name: "Administration",
        description:
          "Roles, permissions, multi-tenant workspaces, and audit logs.",
      },
    ],
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
