"use client";

import { motion } from "motion/react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  ShieldCheck,
  Sparkles,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { serviceLines } from "@/lib/landing-data";
import { Reveal, Stagger, StaggerItem } from "./motion/primitives";

/** Icon + tint per service line. Tint classes are static so Tailwind keeps them. */
const meta: Record<string, { icon: LucideIcon; tint: string }> = {
  "Commercial Cleaning": {
    icon: Sparkles,
    tint: "bg-amber-100 text-amber-600 ring-amber-200",
  },
  "Security Staffing": {
    icon: ShieldCheck,
    tint: "bg-blue-100 text-blue-600 ring-blue-200",
  },
  "Parking Management": {
    icon: CarFront,
    tint: "bg-emerald-100 text-emerald-600 ring-emerald-200",
  },
  "Event Venue Setup": {
    icon: CalendarDays,
    tint: "bg-violet-100 text-violet-600 ring-violet-200",
  },
  "Facility Support": {
    icon: Wrench,
    tint: "bg-slate-200 text-slate-600 ring-slate-300",
  },
};

export default function ServiceLinesSection() {
  return (
    <section id="services" className="bg-white py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
            Service lines
          </span>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Five service lines, one operating system
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-500">
            Every AOG service runs through the same platform — dispatched,
            tracked, and quality-checked with a shared source of truth.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {serviceLines.map((service) => {
            const { icon: Icon, tint } = meta[service.name];
            return (
              <StaggerItem
                key={service.name}
                className={
                  service.featured ? "sm:col-span-2 lg:col-span-2" : undefined
                }
              >
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-7 transition-all duration-300 ${
                    service.featured
                      ? "border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:shadow-[0_16px_50px_-16px_rgba(217,119,6,0.28)]"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-[0_12px_40px_-16px_rgba(15,23,42,0.15)]"
                  }`}
                >
                  {service.featured && (
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-300/20 blur-3xl transition-opacity duration-500 group-hover:bg-amber-300/30"
                    />
                  )}

                  <span
                    className={`relative flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-inset ${tint}`}
                  >
                    <Icon className="h-6 w-6" />
                  </span>

                  <h3
                    className={`relative mt-5 font-semibold text-slate-900 ${
                      service.featured ? "text-xl" : "text-lg"
                    }`}
                  >
                    {service.name}
                  </h3>
                  <p
                    className={`relative mt-2 flex-1 leading-6 text-slate-600 ${
                      service.featured ? "max-w-md text-base" : "text-sm"
                    }`}
                  >
                    {service.description}
                  </p>

                  {service.tags && (
                    <div className="relative mt-5 flex flex-wrap gap-2">
                      {service.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-amber-300 bg-amber-100/60 px-3 py-1 text-xs font-medium text-amber-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal className="mt-12" delay={0.1}>
          <Link
            href="/modules"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-900 hover:text-slate-900"
          >
            See all modules in a live walkthrough
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
