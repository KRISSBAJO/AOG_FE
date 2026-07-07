import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

import { StatusPill } from "@/components/dashboard/StatusPill";
import { ButtonLink, Card, CardHeader } from "@/components/ui";
import { cn } from "@/lib/utils";

export type DetailItem = {
  label: string;
  value: ReactNode;
};

export function DetailHeader({
  title,
  subtitle,
  status,
  backHref,
}: {
  title: string;
  subtitle?: string;
  status?: string | null;
  backHref: string;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <ButtonLink href={backHref} variant="ghost" size="sm" className="mb-3 w-fit">
          <ArrowLeft className="h-4 w-4" />
          Back
        </ButtonLink>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {status && <StatusPill status={status} />}
        </div>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}

export function DetailGrid({
  title,
  items,
  className,
}: {
  title: string;
  items: DetailItem[];
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader title={title} />
      <dl className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="bg-white p-5">
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {item.label}
            </dt>
            <dd className="mt-2 break-words text-sm font-medium text-slate-900">
              {item.value === null || item.value === undefined || item.value === ""
                ? "Not set"
                : item.value}
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export function DetailLoading() {
  return (
    <Card className="p-5">
      <p className="text-sm text-slate-500">Loading record...</p>
    </Card>
  );
}
