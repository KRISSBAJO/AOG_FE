import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, Phone, Search } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import ContactForm from "@/components/landing/ContactForm";

export const metadata: Metadata = {
  title: "Request Service | AOG Services",
  description:
    "Request cleaning, security, parking, event setup, or facility support service from AOG Services.",
};

const channels = [
  {
    icon: Mail,
    label: "Email us",
    value: "sales@aoggroup.com",
    href: "mailto:sales@aoggroup.com",
    tone: "bg-sky-50 text-sky-600 ring-sky-100",
  },
  {
    icon: Phone,
    label: "Call us",
    value: "+1 (414) 319-1622",
    href: "tel:+14143191622",
    tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  },
  {
    icon: MapPin,
    label: "Head office",
    value: "100 Antioch Pike, Suite bb213, Nashville, TN",
    tone: "bg-violet-50 text-violet-600 ring-violet-100",
  },
  {
    icon: Clock,
    label: "Public tracking",
    value: "Order number issued instantly",
    tone: "bg-amber-50 text-amber-600 ring-amber-100",
  },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1 bg-slate-50">
        <section className="relative overflow-hidden border-b border-slate-200 bg-white">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(14,165,233,0.10),rgba(255,255,255,0)_38%,rgba(16,185,129,0.10))]"
          />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_0.72fr] lg:px-8 lg:py-12">
            <div>
              <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-sky-700">
                Request service
              </span>
              <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Book facility service without the back-and-forth
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Submit the request once, receive an order number, and track the
                service status publicly with requester verification.
              </p>
            </div>

            <div className="flex items-end lg:justify-end">
              <Link
                href="/booking-status"
                className="group inline-flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-sky-200 hover:shadow-md sm:max-w-sm"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white">
                    <Search className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-950">
                      Already booked?
                    </span>
                    <span className="mt-0.5 block text-sm text-slate-500">
                      Check request status
                    </span>
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-sky-600" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 lg:grid-cols-[0.86fr_1.14fr] lg:px-8">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                Service support
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">
                Reach the AOG team directly, or submit the form for a
                trackable service request.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {channels.map((channel) => {
                  const Icon = channel.icon;
                  const content = (
                    <div className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
                      <span
                        className={`flex h-11 w-11 flex-none items-center justify-center rounded-lg ring-1 ${channel.tone}`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-500">
                          {channel.label}
                        </p>
                        <p className="mt-1 text-sm font-bold leading-5 text-slate-950">
                          {channel.value}
                        </p>
                      </div>
                    </div>
                  );
                  return channel.href ? (
                    <a key={channel.label} href={channel.href}>
                      {content}
                    </a>
                  ) : (
                    <div key={channel.label}>{content}</div>
                  );
                })}
              </div>
            </aside>

            <ContactForm />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
