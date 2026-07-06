"use client";

import { motion } from "motion/react";
import { weeklyJobs } from "@/lib/dashboard-data";

/** Lightweight animated bar chart — no charting dependency. */
export function JobsChart() {
  const max = Math.max(...weeklyJobs.map((d) => d.value));
  return (
    <div className="flex h-56 items-stretch gap-3 px-5 pb-5 pt-2">
      {weeklyJobs.map((d, i) => (
        <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${(d.value / max) * 100}%` }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                delay: i * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative w-full rounded-t-md bg-gradient-to-t from-amber-400 to-amber-300 hover:from-amber-500 hover:to-amber-400"
            >
              <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-[#0B1120] px-1.5 py-0.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                {d.value}
              </span>
            </motion.div>
          </div>
          <span className="text-xs text-slate-400">{d.day}</span>
        </div>
      ))}
    </div>
  );
}
