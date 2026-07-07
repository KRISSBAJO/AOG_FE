"use client";

import { motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { MiniSparkline } from "./DashboardCharts";
import { cn } from "@/lib/utils";

export type OverviewMetric = {
  label: string;
  value: string;
  helper: string;
  delta: number;
  icon: LucideIcon;
  tone: "amber" | "emerald" | "sky" | "violet";
  sparkline: number[];
};

const toneClass = {
  amber: {
    icon: "bg-amber-100 text-amber-700",
    line: "text-amber-500",
    glow: "shadow-amber-500/10",
  },
  emerald: {
    icon: "bg-emerald-100 text-emerald-700",
    line: "text-emerald-500",
    glow: "shadow-emerald-500/10",
  },
  sky: {
    icon: "bg-sky-100 text-sky-700",
    line: "text-sky-500",
    glow: "shadow-sky-500/10",
  },
  violet: {
    icon: "bg-violet-100 text-violet-700",
    line: "text-violet-500",
    glow: "shadow-violet-500/10",
  },
};

export function OverviewMetricCard({
  metric,
  index = 0,
}: {
  metric: OverviewMetric;
  index?: number;
}) {
  const Icon = metric.icon;
  const positive = metric.delta >= 0;
  const tone = toneClass[metric.tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white bg-white p-5 shadow-lg shadow-slate-200/70",
        tone.glow,
      )}
    >
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-slate-100" />
      <div className="relative flex items-start justify-between gap-3">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", tone.icon)}>
          <Icon className="h-5 w-5" />
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold",
            positive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
          )}
        >
          {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {Math.abs(metric.delta)}%
        </span>
      </div>

      <div className="relative mt-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-3xl font-black tracking-tight text-slate-950">{metric.value}</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">{metric.label}</p>
          <p className="mt-1 text-xs text-slate-400">{metric.helper}</p>
        </div>
        <MiniSparkline values={metric.sparkline} className={tone.line} />
      </div>
    </motion.div>
  );
}
