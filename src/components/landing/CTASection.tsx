"use client";

import { motion } from "motion/react";
import { ClipboardList, Search } from "lucide-react";
import { ButtonLink } from "@/components/ui";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function CTASection() {
  return (
    <section id="contact" className="bg-white py-20">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.65, ease: EASE }}
        className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-slate-50 px-6 py-12 text-center shadow-sm sm:px-12"
      >
        <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Need service at a facility?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Submit a cleaning, security, parking, event, or facility support
          request and get an order number for public status tracking.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/contact" size="lg">
            <ClipboardList className="h-4 w-4" />
            Request a service
          </ButtonLink>
          <ButtonLink href="/booking-status" variant="outline" size="lg">
            <Search className="h-4 w-4" />
            Check status
          </ButtonLink>
        </div>
      </motion.div>
    </section>
  );
}
