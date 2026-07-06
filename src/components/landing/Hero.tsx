"use client";

import { motion } from "motion/react";
import { AnimatedNumber } from "./motion/primitives";

const EASE = [0.22, 1, 0.36, 1] as const;

const stats = [
  { value: 20, suffix: "+", label: "Integrated operating modules" },
  { value: 9, suffix: "", label: "Service lines on one platform" },
  { value: 24, suffix: "/7", label: "Live dispatch & field visibility" },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0B1120]">
      {/* Animated ambient glow */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-amber-400/20 blur-3xl"
        animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-0 h-[28rem] w-[28rem] rounded-full bg-blue-500/20 blur-3xl"
        animate={{ x: [0, -50, 0], y: [0, 60, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Subtle grid overlay */}
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

      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-8 lg:pt-28">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            variants={item}
            className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300"
          >
            <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
            Enterprise Facilities Operations Platform
          </motion.span>

          <motion.h1
            variants={item}
            className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl"
          >
            One platform to run every{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10 bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                facility service
              </span>
            </span>{" "}
            you deliver
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 text-lg leading-8 text-slate-300"
          >
            AOG OS replaces disconnected spreadsheets and single-purpose booking
            apps with a single system of record for cleaning, security, parking,
            events, and facility maintenance — from contract to invoice.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <motion.a
              href="#contact"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-md bg-amber-400 px-6 py-3 text-sm font-semibold text-[#0B1120] shadow-lg shadow-amber-400/20 transition-colors hover:bg-amber-300 sm:w-auto"
            >
              Request a demo
            </motion.a>
            <motion.a
              href="#platform"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="w-full rounded-md border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
            >
              Explore the platform
            </motion.a>
          </motion.div>
        </motion.div>

        <motion.dl
          className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-8 border-t border-white/10 pt-10 sm:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {stats.map((stat) => (
            <motion.div key={stat.label} variants={item} className="text-center">
              <dt className="text-3xl font-semibold text-white">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
              </dt>
              <dd className="mt-1 text-sm text-slate-400">{stat.label}</dd>
            </motion.div>
          ))}
        </motion.dl>
      </div>
    </section>
  );
}
