"use client";

import { motion } from "motion/react";
import { aiHighlights, workflowHighlights } from "@/lib/landing-data";

const EASE = [0.22, 1, 0.36, 1] as const;

const listContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const listItem = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
};

function Panel({
  eyebrow,
  title,
  items,
  fromLeft,
}: {
  eyebrow: string;
  title: string;
  items: string[];
  fromLeft: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: fromLeft ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE }}
      whileHover={{ y: -4 }}
      className="rounded-2xl border border-white/10 bg-white/5 p-8 transition-colors hover:border-amber-400/30"
    >
      <span className="text-sm font-semibold uppercase tracking-wide text-amber-300">
        {eyebrow}
      </span>
      <h3 className="mt-3 text-2xl font-semibold text-white">{title}</h3>
      <motion.ul
        className="mt-6 space-y-3"
        variants={listContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        {items.map((item) => (
          <motion.li
            key={item}
            variants={listItem}
            className="flex gap-3 text-sm text-slate-300"
          >
            <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-amber-400" />
            {item}
          </motion.li>
        ))}
      </motion.ul>
    </motion.div>
  );
}

export default function WorkflowAISection() {
  return (
    <section id="workflow" className="bg-[#0B1120] py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <Panel
            eyebrow="Workflow engine"
            title="Enterprise-grade approvals, without the enterprise wait"
            items={workflowHighlights}
            fromLeft
          />
          <Panel
            eyebrow="AI assistant"
            title="Operational intelligence built into every module"
            items={aiHighlights}
            fromLeft={false}
          />
        </div>
      </div>
    </section>
  );
}
