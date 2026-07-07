"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import {
  defaultDashboardHref,
  isDashboardPathAllowed,
  visibleNavSections,
} from "@/lib/dashboard-nav";
import { getMe, type AuthUser } from "@/lib/auth";
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const navSections = visibleNavSections(user);
  const activeItem =
    navSections
      .flatMap((section) => section.items)
      .filter((item) => item.href === pathname || pathname.startsWith(`${item.href}/`))
      .sort((a, b) => b.href.length - a.href.length)[0]?.label ?? "Overview";

  useEffect(() => {
    const stored = window.localStorage.getItem("aog.sidebarCollapsed");
    if (stored) setCollapsed(stored === "true");
  }, []);

  useEffect(() => {
    let active = true;
    getMe()
      .then((profile) => {
        if (active) setUser(profile);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user || isDashboardPathAllowed(pathname, user)) return;
    router.replace(defaultDashboardHref(user));
  }, [pathname, router, user]);

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
        sections={navSections}
      />
      <div
        className={cn(
          "transition-[padding] duration-300 ease-out",
          collapsed ? "lg:pl-20" : "lg:pl-64",
        )}
      >
        <Topbar onOpenMenu={() => setOpen(true)} user={user} navSections={navSections} />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
