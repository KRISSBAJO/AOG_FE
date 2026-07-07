"use client";

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Building2,
  ClipboardList,
  Clock3,
} from "lucide-react";
import { motion } from "motion/react";
import { AnimatedNumber } from "./motion/primitives";

const EASE = [0.22, 1, 0.36, 1] as const;

const stats = [
  { value: "05", label: "Service lines" },
  { value: "99.4%", label: "SLA adherence" },
  { value: "24/7", label: "Live monitoring" },
];

const commandMetrics = [
  {
    label: "Open requests",
    value: "42",
    detail: "+8 today",
    icon: ClipboardList,
    accent: true,
  },
  {
    label: "Crew on site",
    value: "64",
    detail: "87% utilized",
    icon: Building2,
    accent: false,
  },
  {
    label: "SLA risk",
    value: "03",
    detail: "needs review",
    icon: AlertTriangle,
    accent: false,
  },
];

const pipelineStages = [
  { label: "Received", count: "42", width: "w-[82%]" },
  { label: "Scheduled", count: "31", width: "w-[61%]" },
  { label: "In progress", count: "18", width: "w-[38%]" },
];

const dispatchRows = [
  {
    id: "WO-2841",
    service: "Deep clean",
    site: "Northgate · Floor 14",
    eta: "08:30",
    status: "QA",
    badge: "border-white/10 bg-white/[0.05] text-slate-300",
  },
  {
    id: "WO-2839",
    service: "Night security",
    site: "Gate 3",
    eta: "21:00",
    status: "Active",
    badge: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#070B14]">
      {/* Ambient depth: warm bloom, cool counterweight, faded grid, top sheen */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-48 -top-52 h-[38rem] w-[38rem] rounded-full bg-amber-500/10 blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-48 top-32 h-[34rem] w-[34rem] rounded-full bg-sky-500/[0.05] blur-[130px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 80% 60% at 40% 20%, black, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 60% at 40% 20%, black, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-12 lg:px-8 lg:pb-28 lg:pt-24">
        {/* ---------------- Left: thesis ---------------- */}
        <motion.div variants={container} initial="hidden" animate="visible">
          <motion.span
            variants={item}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-300"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
            </span>
            Enterprise facilities operations
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-6 max-w-xl text-4xl font-semibold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]"
          >
            Every facility service, run from{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 bg-clip-text text-transparent">
              one command center
            </span>
            .
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-lg leading-8 text-slate-400"
          >
            Book, dispatch, monitor, and bill cleaning, security, parking,
            events, and maintenance — with live visibility across every site you
            run.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <motion.a
              href="/contact"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-b from-amber-300 to-amber-400 px-6 py-3.5 text-sm font-semibold text-[#0B1120] shadow-lg shadow-amber-500/25 transition-colors hover:to-amber-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070B14]"
            >
              Request a service
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </motion.a>
            <motion.a
              href="/modules"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Explore the platform
            </motion.a>
          </motion.div>

          <motion.p
            variants={item}
            className="mt-7 text-sm text-slate-500"
          >
            Trusted by operations teams across hospitals, airports, malls, and
            campuses.
          </motion.p>

          {/* Telemetry readout — mono numerals reinforce the command-center theme */}
          <motion.dl
            variants={item}
            className="mt-8 grid max-w-lg grid-cols-3 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02]"
          >
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={`px-5 py-4 ${i > 0 ? "border-l border-white/[0.08]" : ""}`}
              >
                <dt className="font-mono text-2xl font-medium tracking-tight text-white">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  {stat.label}
                </dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>

        {/* ---------------- Right: the command center ---------------- */}
        <motion.div
          className="relative lg:justify-self-end"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
        >
          {/* floating glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-6 rounded-[32px] bg-gradient-to-br from-amber-500/10 via-transparent to-sky-500/10 blur-2xl"
          />

          <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#111C30] to-[#0A1220] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.85)]">
            {/* top rim highlight */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
            />

            {/* window chrome */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  Operations command center
                </p>
                <p className="mt-1 font-mono text-[11px] text-slate-500">
                  aog-os · live read model
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Synced
              </span>
            </div>

            <div className="space-y-3 p-4">
              {/* KPI row */}
              <div className="grid grid-cols-3 gap-3">
                {commandMetrics.map(({ label, value, detail, icon: Icon, accent }) => (
                  <div
                    key={label}
                    className={`rounded-xl border p-3.5 ${
                      accent
                        ? "border-amber-400/20 bg-amber-400/[0.06]"
                        : "border-white/[0.08] bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
                        {label}
                      </p>
                      <Icon
                        className={`h-4 w-4 ${accent ? "text-amber-300" : "text-slate-500"}`}
                      />
                    </div>
                    <p className="mt-2.5 font-mono text-2xl font-medium tracking-tight text-white">
                      {accent ? <AnimatedNumber value={42} /> : value}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">{detail}</p>
                  </div>
                ))}
              </div>

              {/* Pipeline */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-white">
                    Work order pipeline
                  </p>
                  <span className="font-mono text-[11px] text-slate-500">
                    today
                  </span>
                </div>
                <div className="mt-4 space-y-3.5">
                  {pipelineStages.map((stage, i) => (
                    <div key={stage.label}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-slate-400">{stage.label}</span>
                        <span className="font-mono font-medium text-white">
                          {stage.count}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          className={`h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 ${stage.width}`}
                          style={{ transformOrigin: "left" }}
                          transition={{
                            duration: 0.8,
                            delay: 0.5 + i * 0.12,
                            ease: EASE,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dispatch board */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02]">
                <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
                  <p className="text-sm font-semibold text-white">
                    Dispatch board
                  </p>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                    <Clock3 className="h-3.5 w-3.5" />
                    next 4h
                  </span>
                </div>
                <div className="divide-y divide-white/[0.06]">
                  {dispatchRows.map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-[84px_1fr_auto] items-center gap-3 px-4 py-3"
                    >
                      <span className="font-mono text-xs font-medium text-amber-300/90">
                        {row.id}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {row.service}
                        </p>
                        <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500">
                          {row.site} · ETA {row.eta}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${row.badge}`}
                      >
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
