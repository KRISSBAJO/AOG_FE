"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, type LucideIcon } from "lucide-react";

/**
 * Right-aligned slide-over panel for focused create/edit flows.
 * Children typically render a `<form className="flex h-full flex-col">`
 * with a scrollable field area and a sticky footer.
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div className="flex items-start gap-3">
                {Icon && (
                  <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-100">
                    <Icon className="h-5 w-5" />
                  </span>
                )}
                <div>
                  <h2 className="text-base font-semibold tracking-tight text-slate-900">
                    {title}
                  </h2>
                  {description && (
                    <p className="mt-0.5 text-sm leading-5 text-slate-500">
                      {description}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Labelled section inside a drawer form. */
export function DrawerSection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-4">
      {title && (
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}
