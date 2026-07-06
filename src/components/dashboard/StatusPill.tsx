import { cn } from "@/lib/utils";

const toneByStatus: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  DRAFT: "bg-slate-100 text-slate-700 ring-slate-500/20",
  LEAD: "bg-sky-50 text-sky-700 ring-sky-600/20",
  PAUSED: "bg-amber-50 text-amber-700 ring-amber-600/20",
  RENEWAL_PENDING: "bg-violet-50 text-violet-700 ring-violet-600/20",
  INACTIVE: "bg-slate-100 text-slate-600 ring-slate-500/20",
  ARCHIVED: "bg-slate-100 text-slate-500 ring-slate-500/20",
  TERMINATED: "bg-red-50 text-red-700 ring-red-600/20",
  EXPIRED: "bg-red-50 text-red-700 ring-red-600/20",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneByStatus[status] ?? "bg-slate-100 text-slate-700 ring-slate-500/20",
      )}
    >
      {status.replaceAll("_", " ").toLowerCase()}
    </span>
  );
}
