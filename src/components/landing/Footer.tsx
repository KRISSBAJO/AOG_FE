const columns = [
  {
    title: "Platform",
    links: ["Contract Management", "Facility Management", "Scheduling & Dispatch", "Finance & Billing"],
  },
  {
    title: "Services",
    links: ["Cleaning", "Security", "Parking", "Events"],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Contact"],
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
              AOG Services — Enterprise Facilities Operations Management
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
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t border-white/10 pt-8 text-sm text-slate-500">
          © {new Date().getFullYear()} AOG Services. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
