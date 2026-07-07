"use client";

import { ArrowRight, BadgeCheck, ClipboardList, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedNumber } from "./motion/primitives";

const EASE = [0.22, 1, 0.36, 1] as const;

const stats = [
  { value: 5, suffix: "", label: "Service lines" },
  { value: 99.4, suffix: "%", label: "SLA adherence" },
  { value: 24, suffix: "/7", label: "Live monitoring" },
];

const consoleStats = [
  { label: "Requests", value: "42", icon: ClipboardList },
  { label: "Work orders", value: "128", icon: BadgeCheck },
  { label: "On-site staff", value: "64", icon: ShieldCheck },
];

const volumeBars = [
  { height: 36, color: "bg-sky-400/45" },
  { height: 46, color: "bg-cyan-300/45" },
  { height: 32, color: "bg-indigo-300/45" },
  { height: 52, color: "bg-teal-300/45" },
  { height: 40, color: "bg-blue-300/45" },
  { height: 58, color: "bg-emerald-300/45" },
  { height: 48, color: "bg-violet-300/55" },
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
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(245,158,11,0.16)_0%,rgba(11,17,32,0.15)_22%,rgba(37,99,235,0.14)_100%)]"
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-6 pb-20 pt-16 lg:grid-cols-[0.92fr_1fr] lg:px-8 lg:pb-24 lg:pt-24">
        <motion.div
          className="flex flex-col justify-center"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            variants={item}
            className="inline-flex w-fit items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase text-amber-300"
          >
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-amber-400" />
            Enterprise Facility Operations
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-6 max-w-xl text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl"
          >
            Facility services,{" "}
            <span className="text-amber-400">managed</span> in one place
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg"
          >
            Book, schedule, track, and bill cleaning, security, parking,
            events, and facility support from one command center.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <motion.a
              href="/contact"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-amber-400 px-6 py-3.5 text-sm font-black text-[#0B1120] shadow-lg shadow-amber-400/20 transition hover:bg-amber-300"
            >
              Request a service
              <ArrowRight className="h-4 w-4" />
            </motion.a>
            <motion.a
              href="#modules"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Explore Services
            </motion.a>
          </motion.div>

          <motion.dl
            variants={container}
            className="mt-10 grid max-w-lg grid-cols-3 divide-x divide-white/10"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={item} className="px-5 first:pl-0 last:pr-0">
                <dt className="text-2xl font-black tracking-tight text-white sm:text-3xl">
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
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.12] bg-[#121827]/90 shadow-2xl shadow-black/35">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-sm font-black text-white">Operations Console</p>
                <p className="mt-1 text-xs text-slate-500">Today&apos;s live service picture</p>
              </div>
              <span className="rounded-lg bg-emerald-400 px-3 py-1.5 text-xs font-black text-[#052012]">
                Live
              </span>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-3 gap-3">
                {consoleStats.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-bold uppercase text-slate-500">{label}</p>
                      <Icon className="h-4 w-4 text-sky-300" />
                    </div>
                    <p className="mt-3 text-2xl font-black text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.035] p-4">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <p className="font-bold text-white">Service volume</p>
                  <p className="text-xs text-slate-500">Last 7 days</p>
                </div>
                <div className="flex h-16 items-end gap-1.5">
                  {volumeBars.map((bar, index) => (
                    <span
                      key={index}
                      className={`flex-1 rounded-t ${bar.color}`}
                      style={{ height: `${bar.height}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {[
                  ["#WO-2841", "Deep clean - Floor 14", "Done"],
                  ["#WO-2839", "Night security - Gate 3", "Active"],
                ].map(([id, title, status]) => (
                  <div key={id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3">
                    <div className="min-w-0">
                      <span className="rounded-md bg-sky-400/15 px-2 py-1 text-xs font-black text-sky-300">{id}</span>
                      <span className="ml-3 text-sm font-semibold text-white">{title}</span>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${
                      status === "Done"
                        ? "bg-emerald-400 text-[#052012]"
                        : "bg-sky-300 text-[#08111f]"
                    }`}>
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
