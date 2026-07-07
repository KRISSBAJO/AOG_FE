import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import ModuleCatalog from "@/components/landing/ModuleCatalog";
import { moduleCatalog, serviceLines } from "@/lib/landing-data";

export const metadata: Metadata = {
  title: "All Modules | AOG Services",
  description:
    "The full AOG OS module catalogue — every service line, workforce, asset, finance, and platform module in one operating system.",
};

const totalModules = moduleCatalog.reduce(
  (sum, group) => sum + group.modules.length,
  0
);

const stats = [
  { value: `${totalModules}+`, label: "Integrated modules" },
  { value: `${moduleCatalog.length}`, label: "Operating domains" },
  { value: `${serviceLines.length}`, label: "Service lines" },
];

export default function ModulesPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1 bg-white">
        {/* Hero band */}
        <section className="bg-[#0B1120] pb-20 pt-20">
          <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
              The full platform
            </span>
            <h1 className="mx-auto mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Every module in AOG OS
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              One operating system for every service line, backed by shared
              workforce, asset, finance, and platform modules. Explore the whole
              catalogue below.
            </p>

            <div className="mx-auto mt-10 flex max-w-lg items-center justify-center gap-8 border-t border-white/10 pt-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl font-semibold text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-[#0B1120] shadow-lg shadow-amber-400/20 transition-colors hover:bg-amber-300"
              >
                Book a live walkthrough
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Service lines recap */}
        <section className="border-b border-slate-200 bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
                Service lines
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                The services we deliver
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-500">
                Every line below runs on the same modules — so a job booked by a
                customer flows straight through to dispatch, QA, and billing.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {serviceLines.map((service) => (
                <div
                  key={service.name}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <h3 className="text-base font-semibold text-slate-900">
                    {service.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {service.description}
                  </p>
                  {service.tags && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {service.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-amber-300 bg-amber-100/60 px-3 py-1 text-xs font-medium text-amber-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Full module catalogue */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-600">
                Module catalogue
              </span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Everything, grouped by what it does
              </h2>
            </div>
            <ModuleCatalog />
          </div>
        </section>

        {/* Closing CTA */}
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              See these modules running your facilities
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-500">
              Tell us your service lines and facility count — we&apos;ll tailor
              the walkthrough to the modules that matter to you.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0B1120] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#0B1120]/90"
            >
              Request a walkthrough
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
