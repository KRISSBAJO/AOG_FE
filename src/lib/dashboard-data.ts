import {
  FileText,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Status } from "@/components/ui/StatusBadge";

export type Stat = {
  label: string;
  value: string;
  delta: number;
  icon: LucideIcon;
};

export const stats: Stat[] = [
  { label: "Active contracts", value: "128", delta: 4.2, icon: FileText },
  { label: "Jobs completed (wk)", value: "1,940", delta: 8.1, icon: Sparkles },
  { label: "Staff on shift", value: "312", delta: -2.3, icon: Users },
  { label: "Revenue (MTD)", value: "$482k", delta: 12.5, icon: Wallet },
];

/** Weekly jobs-completed series for the bar chart. */
export const weeklyJobs = [
  { day: "Mon", value: 280 },
  { day: "Tue", value: 340 },
  { day: "Wed", value: 300 },
  { day: "Thu", value: 390 },
  { day: "Fri", value: 420 },
  { day: "Sat", value: 210 },
  { day: "Sun", value: 160 },
];

export type Job = {
  id: string;
  facility: string;
  service: string;
  team: string;
  status: Status;
  due: string;
};

export const recentJobs: Job[] = [
  {
    id: "JOB-4821",
    facility: "Skyline Tower",
    service: "Deep clean — Lobby",
    team: "Crew A",
    status: "in-progress",
    due: "Today, 4:00 PM",
  },
  {
    id: "JOB-4822",
    facility: "Harbor Mall",
    service: "Security night patrol",
    team: "Guard Unit 3",
    status: "scheduled",
    due: "Today, 10:00 PM",
  },
  {
    id: "JOB-4818",
    facility: "Grand Central Hotel",
    service: "Floor care — Ballroom",
    team: "Crew C",
    status: "completed",
    due: "Yesterday",
  },
  {
    id: "JOB-4809",
    facility: "Westgate Warehouse",
    service: "Window cleaning",
    team: "Crew B",
    status: "overdue",
    due: "Jul 4, 2:00 PM",
  },
  {
    id: "JOB-4830",
    facility: "Airport T2",
    service: "Event setup — Gate C",
    team: "Events",
    status: "active",
    due: "Tomorrow, 8:00 AM",
  },
];

export type Activity = {
  who: string;
  action: string;
  target: string;
  time: string;
};

export const activity: Activity[] = [
  {
    who: "Maya Chen",
    action: "approved contract",
    target: "Harbor Mall SLA",
    time: "12m ago",
  },
  {
    who: "Crew A",
    action: "checked in at",
    target: "Skyline Tower",
    time: "34m ago",
  },
  {
    who: "Diego Santos",
    action: "flagged an incident at",
    target: "Airport T2",
    time: "1h ago",
  },
  {
    who: "Finance",
    action: "issued invoice for",
    target: "Grand Central Hotel",
    time: "2h ago",
  },
  {
    who: "Priya Patel",
    action: "onboarded",
    target: "6 new cleaners",
    time: "3h ago",
  },
];
