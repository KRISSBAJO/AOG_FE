"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { Logo } from "@/components/ui";
import { navSections } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

/**
 * App sidebar. Slides on mobile, collapses on desktop, and keeps major
 * navigation groups foldable so the surface stays short and scannable.
 */
export function Sidebar({
  open,
  onClose,
  active = "Overview",
  collapsed = false,
  onToggleCollapsed,
}: {
  open: boolean;
  onClose: () => void;
  active?: string;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  const sectionTitles = useMemo(
    () => navSections.map((section) => section.title).filter(Boolean) as string[],
    [],
  );
  const activeSection = useMemo(
    () => navSections.find((section) => section.items.some((item) => item.label === active))?.title,
    [active],
  );
  const [openSections, setOpenSections] = useState<string[]>(() => (
    [activeSection ?? (sectionTitles.includes("Customer Ops") ? "Customer Ops" : sectionTitles[0])]
      .filter(Boolean) as string[]
  ));

  useEffect(() => {
    if (!activeSection) return;
    setOpenSections((current) => {
      if (current.includes(activeSection)) return current;
      return [...current, activeSection].slice(-2);
    });
  }, [activeSection]);

  function toggleSection(title: string) {
    setOpenSections((current) => {
      if (current.includes(title)) {
        return current.filter((item) => item !== title);
      }

      return [...current, title].slice(-2);
    });
  }

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/50 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/10 bg-[#070C17] shadow-2xl shadow-slate-950/30 transition-[transform,width] duration-300 ease-out lg:translate-x-0",
          collapsed ? "lg:w-20" : "lg:w-64",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Logo
            variant="light"
            href="/dashboard"
            size="md"
            className={cn(collapsed && "lg:hidden")}
          />
          <button
            onClick={onToggleCollapsed}
            className={cn(
              "hidden rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:inline-flex",
              collapsed && "lg:mx-auto",
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navSections.map((section, sectionIndex) => {
            const title = section.title;
            const isOpen = !title || collapsed || openSections.includes(title);

            return (
              <div key={title ?? `section-${sectionIndex}`} className="mb-2">
                {title && (
                  <button
                    type="button"
                    onClick={() => toggleSection(title)}
                    className={cn(
                      "mb-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500 transition hover:bg-white/5 hover:text-slate-300",
                      collapsed && "lg:justify-center lg:px-2",
                    )}
                    title={title}
                    aria-expanded={isOpen}
                  >
                    <span className={cn(collapsed && "lg:hidden")}>{title}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isOpen && "rotate-180",
                        collapsed && "lg:hidden",
                      )}
                    />
                    <span className={cn("hidden h-1.5 w-1.5 rounded-full bg-slate-600", collapsed && "lg:block")} />
                  </button>
                )}

                <ul className={cn("space-y-1 overflow-hidden transition-all", isOpen ? "max-h-[520px]" : "max-h-0")}>
                  {section.items.map((item) => {
                    const isActive = item.label === active;
                    const Icon = item.icon;

                    return (
                      <li key={item.label}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={cn(
                            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                            collapsed && "lg:justify-center lg:px-2",
                            isActive
                              ? "bg-amber-400/15 text-amber-300 shadow-inner shadow-amber-500/5"
                              : "text-slate-300 hover:bg-white/[0.07] hover:text-white",
                          )}
                          title={item.label}
                        >
                          <Icon className="h-4.5 w-4.5 flex-none" />
                          <span className={cn("flex-1 truncate", collapsed && "lg:hidden")}>{item.label}</span>
                          {item.badge && (
                            <span className={cn("rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300", collapsed && "lg:hidden")}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className={cn("border-t border-white/10 p-4", collapsed && "lg:hidden")}>
          <div className="rounded-lg bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">Need a hand?</p>
            <p className="mt-1 text-xs text-slate-400">
              Our team is on call 24/7 for operations support.
            </p>
            <Link
              href="/#contact"
              className="mt-3 inline-block text-xs font-semibold text-amber-300 hover:text-amber-200"
            >
              Contact support -&gt;
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
