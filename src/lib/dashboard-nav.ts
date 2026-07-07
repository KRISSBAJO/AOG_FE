import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  CalendarClock,
  Sparkles,
  ShieldCheck,
  Wallet,
  BarChart3,
  Settings,
  BriefcaseBusiness,
  ClipboardList,
  ClipboardCheck,
  AlertTriangle,
  MessageSquare,
  FolderOpen,
  Wrench,
  Timer,
  ReceiptText,
  type LucideIcon,
} from "lucide-react";
import type { AuthUser } from "@/lib/auth";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};

export const navSections: NavSection[] = [
  {
    items: [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Customer Ops",
    items: [
      {
        label: "Customers",
        href: "/dashboard/customers",
        icon: BriefcaseBusiness,
      },
      { label: "Facilities", href: "/dashboard/facilities", icon: Building2 },
      { label: "Services", href: "/dashboard/services", icon: Sparkles },
      { label: "Contracts", href: "/dashboard/contracts", icon: FileText },
    ],
  },
  {
    title: "Field Ops",
    items: [
      {
        label: "Service Requests",
        href: "/dashboard/service-requests",
        icon: ClipboardList,
      },
      { label: "Work Orders", href: "/dashboard/work-orders", icon: Wrench },
      {
        label: "Scheduling",
        href: "/dashboard/scheduling",
        icon: CalendarClock,
      },
      { label: "QA", href: "/dashboard/qa", icon: ClipboardCheck },
      { label: "Issues", href: "/dashboard/issues", icon: AlertTriangle },
    ],
  },
  {
    title: "Workforce & Finance",
    items: [
      { label: "Workforce", href: "/dashboard/workforce", icon: Users },
      { label: "Time Clock", href: "/dashboard/time-clock", icon: Timer },
      { label: "Payroll", href: "/dashboard/payroll", icon: ReceiptText },
      { label: "Billing", href: "/dashboard/billing", icon: Wallet },
      { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Collaboration",
    items: [
      { label: "Messages", href: "/dashboard/messages", icon: MessageSquare },
      { label: "Files", href: "/dashboard/files", icon: FolderOpen },
    ],
  },
  {
    title: "System",
    items: [{ label: "Settings", href: "/dashboard/settings", icon: Settings }],
  },
];

const FULL_ACCESS_ROLES = new Set(["OWNER", "ADMIN", "MANAGER"]);

const ROLE_NAV: Record<string, Set<string>> = {
  STAFF: new Set([
    "Overview",
    "Work Orders",
    "Scheduling",
    "Time Clock",
    "Messages",
    "Files",
  ]),
  CLIENT_CONTACT: new Set([
    "Overview",
    "Service Requests",
    "Work Orders",
    "Messages",
    "Files",
  ]),
  FACILITY_MANAGER: new Set([
    "Overview",
    "Facilities",
    "Service Requests",
    "Work Orders",
    "QA",
    "Issues",
    "Messages",
    "Files",
  ]),
};

export function getUserRoleNames(user?: AuthUser | null) {
  return new Set(
    user?.userRoles
      ?.map((assignment) => assignment.role?.name?.toUpperCase())
      .filter(Boolean) ?? [],
  );
}

export function hasFullDashboardAccess(user?: AuthUser | null) {
  if (!user) return false;
  if (user.isSiteAdmin) return true;
  const roles = getUserRoleNames(user);
  return [...roles].some((role) => FULL_ACCESS_ROLES.has(role));
}

export function visibleNavSections(user?: AuthUser | null) {
  if (!user || hasFullDashboardAccess(user)) return navSections;

  const allowedLabels = new Set<string>();
  getUserRoleNames(user).forEach((role) => {
    ROLE_NAV[role]?.forEach((label) => allowedLabels.add(label));
  });

  if (!allowedLabels.size) {
    allowedLabels.add("Overview");
  }

  return navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => allowedLabels.has(item.label)),
    }))
    .filter((section) => section.items.length > 0);
}

export function defaultDashboardHref(user?: AuthUser | null) {
  return visibleNavSections(user)[0]?.items[0]?.href ?? "/dashboard";
}

export function isDashboardPathAllowed(pathname: string, user?: AuthUser | null) {
  if (!user || hasFullDashboardAccess(user)) return true;
  const allowedItems = visibleNavSections(user).flatMap((section) => section.items);
  if (pathname === "/dashboard") return true;
  return allowedItems.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}
