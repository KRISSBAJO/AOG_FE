"use client";

import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

export type Stat = {
  label: string;
  value: string;
  delta: number; // percent, +/-
  icon: LucideIcon;
};

/** KPI tile with icon, value, and up/down delta. Animates in. */
export function StatCard({ stat, index = 0 }: { stat: Stat; index?: number }) {
  const positive = stat.delta >= 0;
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400/15 text-amber-600">
            <Icon className="h-5 w-5" />
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-semibold",
              positive ? "text-emerald-600" : "text-red-600"
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {Math.abs(stat.delta)}%
          </span>
        </div>
        <p className="mt-4 text-2xl font-semibold text-slate-900">
          {stat.value}
        </p>
        <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
      </Card>
    </motion.div>
  );
}
