"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;
const DURATION = 6000; // ms each feature stays active

type Feature = {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  caption: string;
};

const features: Feature[] = [
  {
    eyebrow: "Integrated operations",
    title: "Every service under one roof",
    description:
      "Cleaning, security, valet, and window care running side by side in the same facility — coordinated from a single platform instead of four disconnected vendors.",
    image: "/Image_one.png",
    caption: "Multi-service delivery, one facility record",
  },
  {
    eyebrow: "Live oversight",
    title: "Supervisors see the whole floor",
    description:
      "Managers walk the site with real-time job status in hand — who's on shift, what's in progress, and what needs escalation, without a single phone call.",
    image: "/Image_two.png",
    caption: "Real-time supervision from the floor",
  },
  {
    eyebrow: "Monitoring & inspections",
    title: "Eyes on every zone, remotely",
    description:
      "CCTV, checkpoints, and inspection checklists in one pane of glass. Catch an issue on camera and dispatch the nearest crew before it becomes a complaint.",
    image: "/Image_three.png",
    caption: "CCTV & inspections in one view",
  },
  {
    eyebrow: "Proof of work",
    title: "Signed off, right on site",
    description:
      "Before-and-after photos and digital sign-off captured on a phone and shared with the facility rep instantly — every job documented, every approval logged.",
    image: "/Image_four.png",
    caption: "Mobile capture & customer sign-off",
  },
  {
    eyebrow: "Command view",
    title: "One team, every service line",
    description:
      "Cleaning crews, security guards, and event staff coordinated across the same building — dispatched, tracked, and billed from a single command view.",
    image: "/Image_five.png",
    caption: "Cross-service coordination at a glance",
  },
];

export default function FeatureShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
  };

  const goTo = useCallback((index: number) => {
    setActive(index);
  }, []);

  useEffect(() => {
    if (paused) return;
    clear();
    timer.current = setTimeout(() => {
      setActive((prev) => (prev + 1) % features.length);
    }, DURATION);
    return clear;
  }, [active, paused]);

  const current = features[active];

  return (
    <section id="features" className="bg-[#0B1120] py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-semibold uppercase tracking-wide text-amber-300">
            How it works in the field
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Built for the way your teams actually work
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-300">
            From the lobby floor to the command center — see AOG OS across every
            moment of a working shift.
          </p>
        </motion.div>

        <div
          className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Selector list */}
          <div className="order-2 flex flex-col gap-3 lg:order-1">
            {features.map((feature, index) => {
              const isActive = index === active;
              return (
                <button
                  key={feature.title}
                  onClick={() => goTo(index)}
                  className={`group relative overflow-hidden rounded-xl border p-5 text-left transition-colors ${
                    isActive
                      ? "border-amber-400/40 bg-white/[0.06]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 flex-none items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-amber-400 text-[#0B1120]"
                          : "bg-white/10 text-slate-300"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p
                        className={`text-xs font-semibold uppercase tracking-wide ${
                          isActive ? "text-amber-300" : "text-slate-500"
                        }`}
                      >
                        {feature.eyebrow}
                      </p>
                      <h3 className="text-base font-semibold text-white">
                        {feature.title}
                      </h3>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="pl-11 pt-2 text-sm leading-6 text-slate-300">
                          {feature.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* progress bar */}
                  {isActive && (
                    <div className="mt-4 h-0.5 w-full overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        key={active + (paused ? "-paused" : "")}
                        className="h-full bg-amber-400"
                        initial={{ width: "0%" }}
                        animate={{ width: paused ? "0%" : "100%" }}
                        transition={{
                          duration: paused ? 0 : DURATION / 1000,
                          ease: "linear",
                        }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Image stage */}
          <div className="order-1 lg:order-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={active}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.8, ease: EASE }}
                >
                  <Image
                    src={current.image}
                    alt={current.title}
                    fill
                    priority={active === 0}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  {/* gradient scrim for caption legibility */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/10 to-transparent" />
                </motion.div>
              </AnimatePresence>

              {/* caption chip */}
              <div className="absolute inset-x-0 bottom-0 p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span className="text-sm font-medium text-white">
                      {current.caption}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* dot indicators */}
              <div className="absolute right-5 top-5 flex gap-1.5">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goTo(index)}
                    aria-label={`Show feature ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      index === active
                        ? "w-6 bg-amber-400"
                        : "w-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
