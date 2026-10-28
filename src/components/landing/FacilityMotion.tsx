"use client";

import Link from "next/link";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { useState, type ReactNode } from "react";
import s from "./FacilityHome.module.css";

/** One easing curve for the whole page: quick start, long soft landing. */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Spread onto a motion element to play its variants once it scrolls into view. */
export const inView = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, margin: "-80px" },
} as const;

export const group: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};
export const rise: Variants = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};
export const slideIn: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
};
export const fromRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: EASE, delayChildren: 0.35 } },
};
export const grow: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.8, ease: EASE, delay: 0.2 } },
};
export const rail: Variants = {
  hidden: { scaleY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.9, ease: EASE } },
};
export const wipeRight: Variants = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: { clipPath: "inset(0 0% 0 0)", transition: { duration: 1.2, ease: EASE } },
};
export const wipeUp: Variants = {
  hidden: { clipPath: "inset(100% 0 0 0)" },
  visible: { clipPath: "inset(0% 0 0 0)", transition: { duration: 1, ease: EASE } },
};
export const settle: Variants = {
  hidden: { scale: 1.18 },
  visible: { scale: 1, transition: { duration: 1.6, ease: EASE } },
};
export const label: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE, delay: 0.8 } },
};
export const lineGroup: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const line: Variants = {
  hidden: { y: "110%" },
  visible: { y: "0%", transition: { duration: 0.95, ease: EASE } },
};
const draw: Variants = {
  hidden: { pathLength: 0 },
  visible: { pathLength: 1, transition: { duration: 0.55, ease: EASE, delay: 0.15 } },
};
const heroGroup: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14, delayChildren: 0.35 } },
};

export const MotionLink = motion.create(Link);

/** Headline lines that rise out of a mask, one after another. Parent needs `lineGroup`. */
export function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((text) => (
        <span className={s.line} key={text}>
          <motion.span variants={line}>{text}</motion.span>
        </span>
      ))}
    </>
  );
}

/** True once the page has scrolled past the threshold. Drives the compact header. */
export function useScrolled(threshold = 40) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > threshold));
  return scrolled;
}

/** Red line along the header's bottom edge that fills as the reader scrolls. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return <motion.div className={s.progress} style={{ scaleX }} aria-hidden="true" />;
}

/** Hero photo: slow zoom on load, then drifts slower than the page as you scroll. */
export function HeroMedia({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, reduce ? 0 : 160]);
  return (
    <motion.div className={s.heroMedia} style={{ y }}>
      <motion.div
        className={s.heroZoom}
        initial={{ scale: 1.16 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.8, ease: EASE }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** Hero copy: plays its entrance on load and eases away as the hero scrolls off. */
export function HeroContent({ className, children }: { className: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, reduce ? 0 : -70]);
  const opacity = useTransform(scrollY, [0, 520], [1, reduce ? 1 : 0.1]);
  return (
    <motion.div className={className} style={{ y, opacity }} variants={heroGroup} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}

/** Five hairlines that drop into the hero and line up with the five service columns below. */
export function Blueprint() {
  const reduce = useReducedMotion();
  return (
    <div className={s.blueprint} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.8, delay: 0.2 + i * 0.12, ease: EASE }}
        >
          {!reduce && (i === 1 || i === 3) && (
            <motion.i
              className={s.sweep}
              initial={{ top: "-25%" }}
              animate={{ top: "110%" }}
              transition={{ duration: 3.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 3, delay: i === 1 ? 2 : 4.2 }}
            />
          )}
        </motion.span>
      ))}
    </div>
  );
}

/** Map reticle beside the Nashville coordinates. */
export function Reticle() {
  return (
    <svg className={s.reticle} viewBox="0 0 64 64" aria-hidden="true">
      <motion.circle
        cx="32" cy="32" r="29" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 6"
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      <circle cx="32" cy="32" r="18" fill="none" stroke="currentColor" strokeOpacity=".45" />
      <path d="M32 0v14M32 50v14M0 32h14M50 32h14" stroke="currentColor" strokeOpacity=".7" />
      <motion.circle
        cx="32" cy="32" r="4" fill="#df202f"
        animate={{ scale: [1, 1.8, 1], opacity: [1, 0.35, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

/** A check mark that draws itself. Parent needs a variant that reaches "visible". */
export function DrawCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <motion.path d="M20 6 9 17l-5-5" variants={draw} />
    </svg>
  );
}
