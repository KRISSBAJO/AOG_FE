"use client";

import { motion } from "motion/react";
import { roleGroups } from "@/lib/landing-data";
import { Reveal, Stagger, StaggerItem } from "./motion/primitives";

export default function RolesSection() {
  return (
    <section id="roles" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-amber-600">
            Roles & permissions
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Purpose-built views for every person in the operation
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            From the boardroom to the loading dock, everyone gets exactly the
            tools their role needs — nothing more, nothing less.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {roleGroups.map((group) => (
            <StaggerItem key={group.title}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="h-full rounded-2xl border border-slate-200 p-8 transition-colors hover:border-amber-300 hover:shadow-lg"
              >
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {group.title}
                </h3>
                <ul className="mt-5 space-y-4">
                  {group.roles.map((role) => (
                    <li key={role.name} className="group flex gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-amber-400 transition-transform group-hover:scale-150" />
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">
                          {role.name}
                        </span>
                        <span className="block text-sm text-slate-600">
                          {role.detail}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
