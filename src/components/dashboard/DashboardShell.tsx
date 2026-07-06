"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/** Client wrapper wiring the sidebar toggle to the topbar hamburger. */
export function DashboardShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={open} onClose={() => setOpen(false)} active={active} />
      <div className="lg:pl-64">
        <Topbar onOpenMenu={() => setOpen(true)} />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
