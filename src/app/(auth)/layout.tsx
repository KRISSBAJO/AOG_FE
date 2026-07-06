import Image from "next/image";
import { Logo } from "@/components/ui";

const highlights = [
  "One platform for cleaning, security, parking & events",
  "Live dispatch and field visibility, 24/7",
  "Contracts, staffing, and billing in one system of record",
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-[#0B1120] lg:block">
        <Image
          src="/Image_two.png"
          alt=""
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/70 to-[#0B1120]/40" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo variant="light" />

          <div>
            <h2 className="max-w-md text-3xl font-semibold leading-tight text-white">
              Run every facility service from one command center.
            </h2>
            <ul className="mt-8 space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-300">
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.1 3.1 6.8-6.8a1 1 0 0 1 1.4 0Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} AOG Services. All rights reserved.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-white px-6 py-12 sm:px-12">
        {children}
      </div>
    </div>
  );
}
