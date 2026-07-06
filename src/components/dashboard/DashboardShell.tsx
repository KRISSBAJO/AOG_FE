"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { navSections } from "@/lib/dashboard-nav";

/** Client wrapper wiring the sidebar toggle to the topbar hamburger. */
export function DashboardShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const activeItem =
    navSections
      .flatMap((section) => section.items)
      .filter((item) => item.href === pathname || pathname.startsWith(`${item.href}/`))
      .sort((a, b) => b.href.length - a.href.length)[0]?.label ?? "Overview";

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={open} onClose={() => setOpen(false)} active={active ?? activeItem} />
      <div className="lg:pl-64">
        <Topbar onOpenMenu={() => setOpen(true)} />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
