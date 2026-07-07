"use client";

import { motion } from "motion/react";
import { moduleCatalog } from "@/lib/landing-data";
import { Reveal, Stagger, StaggerItem } from "./motion/primitives";

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ModuleCatalog() {
  return (
    <div>
      {/* Category quick-nav */}
      <Reveal className="flex flex-wrap justify-center gap-2">
        {moduleCatalog.map((group) => (
          <a
            key={group.category}
            href={`#${slug(group.category)}`}
            className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
          >
            {group.category}
          </a>
        ))}
      </Reveal>

      <div className="mt-16 space-y-20">
        {moduleCatalog.map((group) => (
          <section
            key={group.category}
            id={slug(group.category)}
            className="scroll-mt-24"
          >
            <Reveal>
              <div className="flex items-baseline justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    {group.category}
                  </h2>
                  <p className="mt-1 text-base text-slate-500">{group.blurb}</p>
                </div>
                <span className="hidden flex-none text-sm font-medium text-slate-400 sm:block">
                  {group.modules.length} modules
                </span>
              </div>
            </Reveal>

            <Stagger className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {group.modules.map((module) => (
                <StaggerItem key={module.name}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="h-full rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:border-amber-300 hover:shadow-[0_12px_40px_-16px_rgba(15,23,42,0.15)]"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 flex-none rounded-full bg-amber-400" />
                      <h3 className="text-base font-semibold text-slate-900">
                        {module.name}
                      </h3>
                    </div>
                    <p className="mt-2.5 text-sm leading-6 text-slate-500">
                      {module.description}
                    </p>
                  </motion.div>
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        ))}
      </div>
    </div>
  );
}
