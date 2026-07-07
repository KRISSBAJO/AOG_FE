"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ChevronDown, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { Logo } from "@/components/ui";
import {
  type AuthUser,
  clearAuthSession,
  getMe,
  logout,
} from "@/lib/auth";

const navLinks = [
  { label: "Platform", href: "/#platform" },
  { label: "Features", href: "/#features" },
  { label: "Services", href: "/#services" },
  { label: "Roles", href: "/#roles" },
];

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);

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
    setAccountOpen(false);
    setUser(null);
    await logout();
    router.push("/");
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-white/10 bg-[#070C17]/88 shadow-[0_12px_34px_rgba(0,0,0,0.22)] backdrop-blur-xl"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}>
          <Logo variant="light" href="/" size="md" />
        </motion.div>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="hidden items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200 transition-colors hover:bg-amber-300 hover:text-[#0B1120] sm:inline-flex"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.08] py-1.5 pl-1.5 pr-3 text-left transition-colors hover:bg-white/[0.12]"
                  aria-expanded={accountOpen}
                  aria-label="Open account menu"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-sm font-black text-[#0B1120]">
                    {initials || <UserRound className="h-4 w-4" />}
                  </span>
                  <span className="hidden max-w-36 sm:block">
                    <span className="block truncate text-sm font-semibold text-white">
                      {user.displayName || "AOG user"}
                    </span>
                    <span className="block truncate text-xs text-slate-400">
                      Signed in
                    </span>
                  </span>
                  <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
                </button>

                {accountOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setAccountOpen(false)}
                    />
                    <div className="absolute right-0 z-20 mt-3 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#0B1120] shadow-2xl shadow-black/40">
                      <div className="border-b border-white/10 px-4 py-3">
                        <p className="truncate text-sm font-semibold text-white">
                          {user.displayName || "AOG user"}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-white/[0.08]"
                      >
                        <LayoutDashboard className="h-4 w-4 text-amber-300" />
                        Open dashboard
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-red-200 hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="hidden text-sm font-medium text-slate-300 transition-colors hover:text-white sm:block"
              >
                Sign in
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/sign-up"
                  className="inline-flex items-center rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-[#0B1120] shadow-lg shadow-amber-400/20 transition-colors hover:bg-amber-300"
                >
                  Get started
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
