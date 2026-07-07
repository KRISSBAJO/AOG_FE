import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  eyebrow = "Workspace command",
  className,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/70",
        className,
      )}
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
            <Sparkles className="h-3 w-3 text-amber-500" />
            {eyebrow}
          </div>
          <h1 className="text-lg font-black tracking-tight text-slate-950 sm:text-xl">{title}</h1>
          {description && (
            <p className="mt-0.5 max-w-3xl text-sm leading-5 text-slate-500">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}
