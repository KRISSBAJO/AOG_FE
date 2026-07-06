"use client";

import { motion } from "motion/react";
import { coreModules } from "@/lib/landing-data";
import { Reveal, Stagger, StaggerItem } from "./motion/primitives";

export default function ModulesSection() {
  return (
    <section id="modules" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-amber-600">
            Modules
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Every service line, one system of record
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Nine of the twenty-plus integrated modules that make up AOG OS —
            from the contract that starts the relationship to the invoice that
            closes it.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coreModules.map((module) => (
            <StaggerItem key={module.name}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group relative h-full overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl"
              >
                {/* glow accent that grows on hover */}
                <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-400/0 blur-2xl transition-all duration-500 group-hover:bg-amber-400/20" />
                <span className="absolute inset-x-0 top-0 h-0.5 w-0 bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500 group-hover:w-full" />
                <h3 className="relative text-base font-semibold text-slate-900">
                  {module.name}
                </h3>
                <p className="relative mt-2 text-sm leading-6 text-slate-600">
                  {module.description}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
