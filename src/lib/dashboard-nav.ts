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

/** Sidebar navigation model. Hrefs point at /dashboard for now. */
export const navSections: NavSection[] = [
  {
    items: [{ label: "Overview", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Operations",
    items: [
      { label: "Contracts", href: "/dashboard", icon: FileText, badge: "12" },
      { label: "Facilities", href: "/dashboard", icon: Building2 },
      { label: "Cleaning", href: "/dashboard", icon: Sparkles },
      { label: "Security", href: "/dashboard", icon: ShieldCheck },
      { label: "Scheduling", href: "/dashboard", icon: CalendarClock },
    ],
  },
  {
    title: "Workforce & Finance",
    items: [
      { label: "Staff", href: "/dashboard", icon: Users },
      { label: "Finance", href: "/dashboard", icon: Wallet },
      { label: "Reports", href: "/dashboard", icon: BarChart3 },
    ],
  },
  {
    title: "System",
    items: [{ label: "Settings", href: "/dashboard", icon: Settings }],
  },
];
