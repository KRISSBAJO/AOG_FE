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
  type LucideIcon,
} from "lucide-react";

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
    title: "Operations",
    items: [
      { label: "Customers", href: "/dashboard/customers", icon: BriefcaseBusiness },
      { label: "Facilities", href: "/dashboard/facilities", icon: Building2 },
      { label: "Services", href: "/dashboard/services", icon: Sparkles },
      { label: "Contracts", href: "/dashboard/contracts", icon: FileText },
      { label: "Service Requests", href: "/dashboard/service-requests", icon: ClipboardList },
      { label: "Work Orders", href: "/dashboard/work-orders", icon: Wrench },
      { label: "Scheduling", href: "/dashboard/scheduling", icon: CalendarClock },
      { label: "QA", href: "/dashboard/qa", icon: ClipboardCheck },
      { label: "Issues", href: "/dashboard/issues", icon: AlertTriangle },
    ],
  },
  {
    title: "Workforce & Finance",
    items: [
      { label: "Workforce", href: "/dashboard/workforce", icon: Users },
      { label: "Billing", href: "/dashboard/billing", icon: Wallet },
      { label: "Reports", href: "/dashboard", icon: BarChart3 },
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
    items: [{ label: "Settings", href: "/dashboard", icon: Settings }],
  },
];
