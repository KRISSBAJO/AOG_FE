"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Wraps the app so Framer Motion honors the user's OS-level
 * "reduce motion" setting — transforms are skipped, opacity kept.
 */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
