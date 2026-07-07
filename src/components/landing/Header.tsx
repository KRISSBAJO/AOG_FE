"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Logo } from "@/components/ui";

const navLinks = [
  { label: "Platform", href: "/#platform" },
  { label: "Features", href: "/#features" },
  { label: "Modules", href: "/#modules" },
  { label: "Roles", href: "/#roles" },
  { label: "Workflow & AI", href: "/#workflow" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-50 border-b border-white/10 bg-[#0B1120]/90 backdrop-blur"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}>
          <Logo variant="light" href="/" />
        </motion.div>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-amber-400 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden text-sm font-medium text-slate-300 transition-colors hover:text-white sm:block"
          >
            Sign in
          </Link>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}>
            <Link
              href="/sign-up"
              className="block rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-[#0B1120] transition-colors hover:bg-amber-300"
            >
              Get started
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
