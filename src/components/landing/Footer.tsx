import Link from "next/link";

const columns = [
  {
    title: "Platform",
    links: [
      { label: "Platform overview", href: "/#platform" },
      { label: "Services", href: "/#services" },
      { label: "All modules", href: "/modules" },
      { label: "Roles", href: "/#roles" },
      { label: "Workflow & AI", href: "/#workflow" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Cleaning", href: "/#features" },
      { label: "Security", href: "/#features" },
      { label: "Parking", href: "/#features" },
      { label: "Events", href: "/#features" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#platform" },
      { label: "Contact", href: "/contact" },
      { label: "Request service", href: "/contact" },
      { label: "Booking status", href: "/booking-status" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#0B1120] py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-amber-400 text-sm font-bold text-[#0B1120]">
              AO
            </span>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              AOG Services - Enterprise Facilities Operations Management
              Platform.
            </p>
          </div>
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold text-white">
                {column.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-white/10 pt-8 text-sm text-slate-500">
          (c) {new Date().getFullYear()} AOG Services. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
