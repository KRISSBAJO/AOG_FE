"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { CheckCircle2, ClipboardList, Search } from "lucide-react";
import { Alert, Button, ButtonLink, Input, Select, Textarea } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import {
  createPublicServiceBooking,
  type PublicBookingCreated,
  type PublicServiceLine,
} from "@/lib/api/public-bookings";
import { isEmail, required } from "@/lib/validation";

const serviceOptions: Array<{ value: PublicServiceLine; label: string }> = [
  { value: "CLEANING", label: "Cleaning" },
  { value: "SECURITY", label: "Security" },
  { value: "PARKING", label: "Parking" },
  { value: "EVENT_SETUP", label: "Event setup" },
  { value: "FACILITY_SUPPORT", label: "Facility support" },
  { value: "OTHER", label: "Other" },
];

type Errors = Partial<Record<
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "serviceLine"
  | "message",
  string
>>;

function phoneLooksValid(value: string) {
  return value.replace(/\D/g, "").length >= 7;
}

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || undefined;
}

function toIsoDateTime(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return undefined;
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PublicBookingCreated | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const firstName = String(data.get("firstName") ?? "").trim();
    const lastName = String(data.get("lastName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const serviceLine = String(data.get("serviceLine") ?? "") as PublicServiceLine;
    const message = String(data.get("message") ?? "").trim();

    const next: Errors = {};
    if (!required(firstName)) next.firstName = "Enter your first name.";
    if (!required(lastName)) next.lastName = "Enter your last name.";
    if (!isEmail(email)) next.email = "Enter a valid email address.";
    if (!phoneLooksValid(phone)) next.phone = "Enter a valid phone number.";
    if (!serviceLine) next.serviceLine = "Choose a service line.";
    if (!required(message)) next.message = "Tell us what service you need.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setFormError(null);
    setLoading(true);
    try {
      const created = await createPublicServiceBooking({
        firstName,
        lastName,
        email,
        phone,
        serviceLine,
        company: optionalString(data.get("company")),
        serviceType: optionalString(data.get("serviceType")),
        facilityName: optionalString(data.get("facilityName")),
        addressLine1: optionalString(data.get("addressLine1")),
        addressLine2: optionalString(data.get("addressLine2")),
        city: optionalString(data.get("city")),
        state: optionalString(data.get("state")),
        postalCode: optionalString(data.get("postalCode")),
        requestedStartAt: toIsoDateTime(data.get("requestedStartAt")),
        preferredTimeWindow: optionalString(data.get("preferredTimeWindow")),
        message,
      });
      setResult(created);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
          Service booking received
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Keep this order number. You can use it with your last name and email
          or phone number to check status any time.
        </p>
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Order number
          </p>
          <p className="mt-1 font-mono text-2xl font-black text-[#0B1120]">
            {result.orderNumber}
          </p>
          <p className="mt-2 text-sm font-medium text-emerald-700">
            Status: {result.status}
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/booking-status" variant="secondary" className="flex-1">
            <Search className="h-4 w-4" />
            Check status
          </ButtonLink>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => {
              setResult(null);
              setErrors({});
              setFormError(null);
            }}
          >
            Request another service
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-start gap-3">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <ClipboardList className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Request a service
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Submit the request and we will generate an order number for public
            status tracking.
          </p>
        </div>
      </div>

      {formError && (
        <Alert tone="error" className="mb-5">
          {formError}
        </Alert>
      )}

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            name="firstName"
            label="First name"
            placeholder="Jordan"
            autoComplete="given-name"
            error={errors.firstName}
          />
          <Input
            name="lastName"
            label="Last name"
            placeholder="Rivera"
            autoComplete="family-name"
            error={errors.lastName}
          />
          <Input
            name="email"
            type="email"
            label="Email"
            placeholder="you@company.com"
            autoComplete="email"
            error={errors.email}
          />
          <Input
            name="phone"
            type="tel"
            label="Phone"
            placeholder="+1 (555) 000-0000"
            autoComplete="tel"
            error={errors.phone}
          />
          <Input
            name="company"
            label="Company"
            placeholder="Company name"
            autoComplete="organization"
          />
          <Input
            name="facilityName"
            label="Facility"
            placeholder="Building or site name"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Select
            name="serviceLine"
            label="Service line"
            placeholder="Choose service"
            options={serviceOptions}
            error={errors.serviceLine}
          />
          <Input
            name="serviceType"
            label="Service type"
            placeholder="Deep cleaning, night security, parking support"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            name="requestedStartAt"
            type="datetime-local"
            label="Preferred start"
          />
          <Input
            name="preferredTimeWindow"
            label="Time window"
            placeholder="Morning, evening, after-hours"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Input
            name="addressLine1"
            label="Address"
            placeholder="Street address"
            autoComplete="address-line1"
          />
          <Input
            name="addressLine2"
            label="Suite or floor"
            placeholder="Optional"
            autoComplete="address-line2"
          />
          <Input name="city" label="City" autoComplete="address-level2" />
          <div className="grid grid-cols-2 gap-4">
            <Input name="state" label="State" autoComplete="address-level1" />
            <Input name="postalCode" label="ZIP" autoComplete="postal-code" />
          </div>
        </div>

        <Textarea
          name="message"
          label="Service details"
          placeholder="Tell us what you need, site access details, coverage schedule, and any urgency."
          rows={5}
          error={errors.message}
        />

        <Button type="submit" size="lg" fullWidth loading={loading}>
          Submit service request
        </Button>
        <p className="text-center text-xs text-slate-400">
          Need an update later? Use the{" "}
          <Link href="/booking-status" className="font-semibold text-slate-600 hover:text-slate-900">
            public status checker
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
