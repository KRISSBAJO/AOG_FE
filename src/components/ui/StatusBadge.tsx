import { cn } from "@/lib/utils";

export type Status =
  | "active"
  | "completed"
  | "in-progress"
  | "scheduled"
  | "overdue";

const styles: Record<Status, string> = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  completed: "bg-slate-100 text-slate-600 ring-slate-500/20",
  "in-progress": "bg-sky-50 text-sky-700 ring-sky-600/20",
  scheduled: "bg-amber-50 text-amber-700 ring-amber-600/20",
  overdue: "bg-red-50 text-red-700 ring-red-600/20",
};

const labels: Record<Status, string> = {
  active: "Active",
  completed: "Completed",
  "in-progress": "In progress",
  scheduled: "Scheduled",
  overdue: "Overdue",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}
