"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import {
  type AuthUser,
  clearAuthSession,
  getMe,
  logout,
} from "@/lib/auth";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let active = true;

    getMe()
      .then((profile) => {
        if (active) setUser(profile);
      })
      .catch(() => {
        clearAuthSession();
        if (active) setUser(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const initials = useMemo(() => {
    const source = user?.displayName || user?.email || "AOG";
    return source
      .split(/\s|@/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [user]);

  async function handleSignOut() {
    setMenuOpen(false);
    setUser(null);
    await logout();
    router.replace("/sign-in");
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/95 px-4 shadow-sm shadow-slate-200/40 backdrop-blur-xl lg:px-8">
      <button
        onClick={onOpenMenu}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500 xl:flex">
        <LayoutDashboard className="h-4 w-4 text-amber-500" />
        AOG Command Center
      </div>

      <div className="relative hidden max-w-xl flex-1 sm:block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search contracts, facilities, staff..."
          className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-500 shadow-sm hover:bg-slate-50 hover:text-slate-900"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm transition hover:bg-slate-50"
            aria-expanded={menuOpen}
            aria-label="Open account menu"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0B1120] text-sm font-black text-amber-300">
              {initials || <UserRound className="h-4 w-4" />}
            </span>
            <span className="hidden min-w-0 text-left sm:block">
              <span className="block max-w-44 truncate text-sm font-semibold text-slate-900">
                {user?.displayName || "AOG user"}
              </span>
              <span className="block max-w-44 truncate text-xs text-slate-500">
                {user?.email || "Authenticated workspace"}
              </span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                <div className="bg-slate-50 px-4 py-4">
                  <p className="truncate text-sm font-bold text-slate-950">
                    {user?.displayName || "AOG user"}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {user?.email || "Signed in"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/dashboard");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <LayoutDashboard className="h-4 w-4 text-amber-500" />
                  Dashboard overview
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/dashboard/settings");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="h-4 w-4 text-slate-500" />
                  Workspace settings
                </button>
                <hr className="border-slate-100" />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
