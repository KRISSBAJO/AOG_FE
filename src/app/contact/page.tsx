import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import ContactForm from "@/components/landing/ContactForm";

export const metadata: Metadata = {
  title: "Contact | AOG Services",
  description:
    "Talk to the AOG Services team about running your cleaning, security, parking, and facility operations on one platform.",
};

const channels = [
  {
    icon: Mail,
    label: "Email us",
    value: "sales@aogservices.com",
    href: "mailto:sales@aogservices.com",
  },
  {
    icon: Phone,
    label: "Call us",
    value: "+1 (555) 026-4700",
    href: "tel:+15550264700",
  },
  {
    icon: MapPin,
    label: "Head office",
    value: "1200 Facilities Way, Suite 400, Austin, TX",
  },
  {
    icon: Clock,
    label: "Response time",
    value: "Within one business day",
  },
];

export default function ContactPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero band */}
        <section className="bg-[#0B1120] pb-28 pt-20">
          <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
            <span className="text-sm font-semibold uppercase tracking-wide text-amber-300">
              Contact
            </span>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Let&apos;s map AOG OS to your operation
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Tell us about your service lines and facility count. We&apos;ll walk
              you through the modules that matter and answer any questions.
            </p>
          </div>
        </section>

        {/* Split content — form overlaps up into the hero */}
        <section className="bg-slate-50 pb-24">
          <div className="mx-auto -mt-16 grid max-w-7xl grid-cols-1 gap-10 px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
            {/* Left: contact channels */}
            <div className="lg:pt-16">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Talk to our team
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Prefer to reach us directly? Use any of the channels below —
                a real person on our operations team will get back to you.
              </p>

              <div className="mt-8 space-y-5">
                {channels.map((channel) => {
                  const Icon = channel.icon;
                  const content = (
                    <div className="flex items-start gap-4">
                      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm ring-1 ring-slate-200">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          {channel.label}
                        </p>
                        <p className="text-base font-semibold text-slate-900">
                          {channel.value}
                        </p>
                      </div>
                    </div>
                  );
                  return channel.href ? (
                    <a
                      key={channel.label}
                      href={channel.href}
                      className="block transition-opacity hover:opacity-80"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={channel.label}>{content}</div>
                  );
                })}
              </div>
            </div>

            {/* Right: the form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
