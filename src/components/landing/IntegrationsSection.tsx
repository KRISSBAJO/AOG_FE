"use client";

import { motion } from "motion/react";
import { integrations } from "@/lib/landing-data";

export default function IntegrationsSection() {
  // Duplicate the list so the marquee can loop seamlessly.
  const loop = [...integrations, ...integrations];

  return (
    <section className="overflow-hidden bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-slate-500">
          Integrates with the systems you already run
        </p>
      </div>

      <div className="relative mt-8">
        {/* fade edges */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-slate-50 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-slate-50 to-transparent" />

        <motion.div
          className="flex w-max gap-4"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        >
          {loop.map((integration, i) => (
            <span
              key={`${integration}-${i}`}
              className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 shadow-sm"
            >
              {integration}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
