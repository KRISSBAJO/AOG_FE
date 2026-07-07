"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { navSections } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

/** Client wrapper wiring the sidebar toggle to the topbar hamburger. */
export function DashboardShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: string;
}) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const activeItem =
    navSections
      .flatMap((section) => section.items)
      .filter((item) => item.href === pathname || pathname.startsWith(`${item.href}/`))
      .sort((a, b) => b.href.length - a.href.length)[0]?.label ?? "Overview";

  useEffect(() => {
    const stored = window.localStorage.getItem("aog.sidebarCollapsed");
    if (stored) setCollapsed(stored === "true");
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("aog.sidebarCollapsed", String(next));
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB]">
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        active={active ?? activeItem}
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
      />
      <div
        className={cn(
          "transition-[padding] duration-300 ease-out",
          collapsed ? "lg:pl-20" : "lg:pl-64",
        )}
      >
        <Topbar onOpenMenu={() => setOpen(true)} />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
