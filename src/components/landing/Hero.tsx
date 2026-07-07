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
  { value: 5, suffix: "", label: "Service lines" },
  { value: 99.4, suffix: "%", label: "SLA adherence" },
  { value: 24, suffix: "/7", label: "Live monitoring" },
];

const commandMetrics = [
  {
    label: "Open requests",
    value: "42",
    detail: "+8 today",
    icon: ClipboardList,
    tone: "text-sky-300",
  },
  {
    label: "Crew utilization",
    value: "87%",
    detail: "64 on site",
    icon: Building2,
    tone: "text-cyan-300",
  },
  {
    label: "SLA risk",
    value: "3",
    detail: "needs review",
    icon: AlertTriangle,
    tone: "text-amber-200",
  },
];

const pipelineStages = [
  { label: "Received", count: "42", width: "w-[76%]", color: "bg-sky-400" },
  { label: "Scheduled", count: "31", width: "w-[58%]", color: "bg-cyan-400" },
  { label: "In progress", count: "18", width: "w-[42%]", color: "bg-blue-400" },
];

const dispatchRows = [
  {
    id: "WO-2841",
    service: "Deep clean",
    site: "Northgate / Floor 14",
    eta: "08:30",
    status: "QA",
    badge: "border-sky-300/30 bg-sky-300/10 text-sky-200",
  },
  {
    id: "WO-2839",
    service: "Night security",
    site: "Gate 3",
    eta: "21:00",
    status: "Active",
    badge: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0B1120]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(245,158,11,0.10)_0%,rgba(11,17,32,0.15)_24%,rgba(37,99,235,0.16)_100%)]"
      />

      <div className="relative mx-auto grid max-w-6xl gap-9 px-6 pb-14 pt-12 lg:grid-cols-[0.92fr_1fr] lg:px-8 lg:pb-18 lg:pt-18">
        <motion.div
          className="flex flex-col justify-center"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            variants={item}
            className="inline-flex w-fit items-center rounded-full border border-sky-300/25 bg-sky-300/10 px-3 py-1 text-xs font-bold uppercase text-sky-200"
          >
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-sky-300" />
            Enterprise Facility Operations
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-5 max-w-lg text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-5xl"
          >
            Facility operations in{" "}
            <span className="text-sky-300">one command center</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-4 max-w-xl text-base leading-7 text-slate-300"
          >
            Book, dispatch, monitor, and bill cleaning, security, parking,
            events, and facility support with live operational visibility.
          </motion.p>

          <motion.div variants={item} className="mt-7 flex flex-col gap-3 sm:flex-row">
            <motion.a
              href="/contact"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-3 rounded-lg bg-amber-400 px-6 py-3.5 text-sm font-black text-[#0B1120] shadow-lg shadow-amber-400/20 transition hover:bg-amber-300"
            >
              Request a service
              <ArrowRight className="h-4 w-4" />
            </motion.a>
            <motion.a
              href="#modules"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Explore Services
            </motion.a>
          </motion.div>

          <motion.dl
            variants={container}
            className="mt-8 grid max-w-md grid-cols-3 divide-x divide-white/10"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={item} className="px-4 first:pl-0 last:pr-0">
                <dt className="text-xl font-black tracking-tight text-white sm:text-2xl">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </dt>
                <dd className="mt-1 text-xs text-slate-500 sm:text-sm">{stat.label}</dd>
              </motion.div>
            ))}
          </motion.dl>
        </motion.div>

        <motion.div
          className="flex items-center lg:justify-end"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, ease: EASE, delay: 0.16 }}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-lg border border-white/[0.12] bg-[#101827]/95 shadow-2xl shadow-black/35">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <p className="text-sm font-black text-white">Operations Command Center</p>
                <p className="mt-1 text-xs text-slate-500">Live workspace read model</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-md border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
                <Activity className="h-3.5 w-3.5" />
                Synced
              </span>
            </div>

            <div className="p-3">
              <div className="grid grid-cols-3 gap-2">
                {commandMetrics.map(({ label, value, detail, icon: Icon, tone }) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-bold uppercase text-slate-500">{label}</p>
                      <Icon className={`h-4 w-4 ${tone}`} />
                    </div>
                    <p className="mt-2 text-xl font-black tracking-tight text-white">{value}</p>
                    <p className="mt-1 text-[11px] font-medium text-slate-500">{detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.035] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-white">Work order pipeline</p>
                  <span className="text-xs font-medium text-slate-500">Today</span>
                </div>

                <div className="mt-4 space-y-3">
                  {pipelineStages.map((stage) => (
                    <div key={stage.label}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-300">{stage.label}</span>
                        <span className="font-bold text-white">{stage.count}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                        <div className={`h-full rounded-full ${stage.width} ${stage.color}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.035]">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                  <p className="text-sm font-bold text-white">Dispatch board</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <Clock3 className="h-3.5 w-3.5" />
                    Next 4 hours
                  </span>
                </div>
                <div className="divide-y divide-white/10">
                  {dispatchRows.map((row) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-[88px_1fr_auto] items-center gap-3 px-4 py-3 text-sm"
                    >
                      <span className="font-mono text-xs font-black text-sky-200">{row.id}</span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{row.service}</p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {row.site} / ETA {row.eta}
                        </p>
                      </div>
                      <span className={`rounded-md border px-2.5 py-1 text-xs font-bold ${row.badge}`}>
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
