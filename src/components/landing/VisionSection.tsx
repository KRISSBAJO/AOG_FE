"use client";

import { motion } from "motion/react";
import { industries } from "@/lib/landing-data";
import { Reveal } from "./motion/primitives";

const EASE = [0.22, 1, 0.36, 1] as const;

const chipContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};
const chip = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE } },
};

export default function VisionSection() {
  return (
    <section id="platform" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          <Reveal direction="right">
            <span className="text-sm font-semibold uppercase tracking-wide text-amber-600">
              Not a booking app
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              You&apos;re not running one service. Your platform shouldn&apos;t
              pretend you are.
            </h2>
            <p className="mt-6 text-base leading-7 text-slate-600">
              Most tools are built around a single flow: customer books a job,
              staff gets assigned. That works for a single-service cleaning
              business — it breaks down the moment you&apos;re managing
              contracts, staffing, security, parking, and events across dozens
              of facilities at once.
            </p>
            <p className="mt-4 text-base leading-7 text-slate-600">
              AOG OS is built as a modular, multi-tenant operations platform.
              A shared foundation — authentication, permissions, workflows,
              notifications, documents, billing — supports every service line,
              so data stays consistent as you add new business units.
            </p>
          </Reveal>

          <Reveal direction="left" delay={0.1}>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Built for facilities like
              </h3>
              <motion.div
                className="mt-5 flex flex-wrap gap-3"
                variants={chipContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
              >
                {industries.map((industry) => (
                  <motion.span
                    key={industry}
                    variants={chip}
                    whileHover={{ y: -3, borderColor: "rgb(217 119 6)" }}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    {industry}
                  </motion.span>
                ))}
              </motion.div>
              <div className="mt-8 rounded-xl bg-[#0B1120] p-6">
                <p className="text-sm leading-6 text-slate-300">
                  Each facility carries its own buildings, floors, zones, assets,
                  schedules, and emergency contacts — shared across every service
                  you deliver there.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
