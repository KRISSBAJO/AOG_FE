"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Logo } from "@/components/ui";
import { navSections } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

/**
 * App sidebar. Fixed on desktop; slides in as an overlay on mobile
 * controlled by `open` / `onClose`. `active` marks the current item.
 */
export function Sidebar({
  open,
  onClose,
  active = "Overview",
}: {
  open: boolean;
  onClose: () => void;
  active?: string;
}) {
  return (
    <>
      {/* mobile backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/50 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#0B1120] transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Logo variant="light" href="/dashboard" />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
          {navSections.map((section, i) => (
            <div key={i}>
              {section.title && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = item.label === active;
                  const Icon = item.icon;
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-amber-400/10 text-amber-300"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <Icon className="h-4.5 w-4.5 flex-none" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-lg bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">Need a hand?</p>
            <p className="mt-1 text-xs text-slate-400">
              Our team is on call 24/7 for operations support.
            </p>
            <Link
              href="/#contact"
              className="mt-3 inline-block text-xs font-semibold text-amber-300 hover:text-amber-200"
            >
              Contact support →
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
