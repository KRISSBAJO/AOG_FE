"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";
import { Alert, Button, Input, Select, Textarea } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import { submitContactRequest } from "@/lib/contact";
import { isEmail, required } from "@/lib/validation";

const facilityOptions = [
  { value: "1-5", label: "1–5 facilities" },
  { value: "6-25", label: "6–25 facilities" },
  { value: "26-100", label: "26–100 facilities" },
  { value: "100+", label: "100+ facilities" },
];

const serviceOptions = [
  "Cleaning",
  "Security",
  "Parking",
  "Events",
  "Maintenance",
];

type Errors = { name?: string; email?: string; message?: string };

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [services, setServices] = useState<string[]>([]);

  function toggleService(service: string) {
    setServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");

    const next: Errors = {};
    if (!required(name)) next.name = "Enter your name.";
    if (!isEmail(email)) next.email = "Enter a valid email address.";
    if (!required(message)) next.message = "Tell us a little about your needs.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setFormError(null);
    setLoading(true);
    try {
      await submitContactRequest({
        name,
        email,
        company: String(data.get("company") ?? "") || undefined,
        phone: String(data.get("phone") ?? "") || undefined,
        facilityCount: String(data.get("facilityCount") ?? "") || undefined,
        services: services.length ? services : undefined,
        message,
      });
      setSent(true);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-5 text-xl font-semibold text-slate-900">
          Thanks — we&apos;ll be in touch
        </h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          A member of our team will reach out within one business day to schedule
          your walkthrough.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setSent(false);
            setServices([]);
          }}
        >
          Send another message
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      {formError && (
        <Alert tone="error" className="mb-5">
          {formError}
        </Alert>
      )}
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            name="name"
            label="Full name"
            placeholder="Jordan Rivera"
            autoComplete="name"
            error={errors.name}
          />
          <Input
            name="email"
            type="email"
            label="Work email"
            placeholder="you@company.com"
            autoComplete="email"
            error={errors.email}
          />
          <Input
            name="company"
            label="Company"
            placeholder="Company name"
            autoComplete="organization"
          />
          <Input
            name="phone"
            type="tel"
            label="Phone (optional)"
            placeholder="+1 (555) 000-0000"
            autoComplete="tel"
          />
        </div>

        <Select
          name="facilityCount"
          label="How many facilities do you manage?"
          placeholder="Select a range"
          options={facilityOptions}
        />

        <div>
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Services you&apos;re interested in
          </span>
          <div className="flex flex-wrap gap-2">
            {serviceOptions.map((service) => {
              const active = services.includes(service);
              return (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggleService(service)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-amber-400 bg-amber-50 text-amber-700"
                      : "border-slate-300 text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {service}
                </button>
              );
            })}
          </div>
        </div>

        <Textarea
          name="message"
          label="How can we help?"
          placeholder="Tell us about your operation, service lines, and what you're looking to solve."
          rows={5}
          error={errors.message}
        />

        <Button type="submit" size="lg" fullWidth loading={loading}>
          Request a walkthrough
        </Button>
        <p className="text-center text-xs text-slate-400">
          By submitting, you agree to be contacted about AOG Services. We never
          share your details.
        </p>
      </form>
    </div>
  );
}
