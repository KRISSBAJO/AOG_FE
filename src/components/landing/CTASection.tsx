"use client";

import { motion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function CTASection() {
  return (
    <section id="contact" className="bg-white py-24">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.75, ease: EASE }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl bg-[#0B1120] px-6 py-16 text-center sm:px-16"
      >
        {/* animated glow behind the CTA */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-400/20 blur-3xl"
          animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            See AOG OS running your facilities
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-300">
            Tell us about your service lines and facility count — we&apos;ll walk
            you through the modules that matter to your operation.
          </p>
          <form className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <label htmlFor="work-email" className="sr-only">
              Work email
            </label>
            <input
              id="work-email"
              type="email"
              required
              placeholder="Work email"
              className="w-full rounded-md border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-amber-400 focus:outline-none"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-md bg-amber-400 px-6 py-3 text-sm font-semibold text-[#0B1120] transition-colors hover:bg-amber-300"
            >
              Request a demo
            </motion.button>
          </form>
        </div>
      </motion.div>
    </section>
  );
}
