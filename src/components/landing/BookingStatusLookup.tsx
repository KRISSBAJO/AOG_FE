"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Circle, Clock3, Search } from "lucide-react";
import { Alert, Button, Input } from "@/components/ui";
import { getErrorMessage } from "@/lib/api";
import {
  lookupPublicServiceBooking,
  type PublicBookingStatus,
} from "@/lib/api/public-bookings";
import { required } from "@/lib/validation";

type Errors = Partial<
  Record<"orderNumber" | "lastName" | "emailOrPhone", string>
>;

function formatDate(value?: string | null) {
  if (!value) return "Not scheduled yet";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function BookingStatusLookup() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<PublicBookingStatus | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const orderNumber = String(data.get("orderNumber") ?? "").trim();
    const lastName = String(data.get("lastName") ?? "").trim();
    const emailOrPhone = String(data.get("emailOrPhone") ?? "").trim();

    const next: Errors = {};
    if (!required(orderNumber)) next.orderNumber = "Enter your order number.";
    if (!required(lastName)) next.lastName = "Enter the requester last name.";
    if (!required(emailOrPhone))
      next.emailOrPhone = "Enter the email or phone used for booking.";
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    setFormError(null);
    try {
      setStatus(
        await lookupPublicServiceBooking({
          orderNumber,
          lastName,
          emailOrPhone,
        }),
      );
    } catch (error) {
      setStatus(null);
      setFormError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        noValidate
      >
        <div className="mb-6 flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Search className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Check booking status
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Use your order number plus the requester last name and email or
              phone number.
            </p>
          </div>
        </div>

        {formError && (
          <Alert tone="error" className="mb-5">
            {formError}
          </Alert>
        )}

        <div className="space-y-5">
          <Input
            name="orderNumber"
            label="Order number"
            placeholder="AOG-202607-0001"
            error={errors.orderNumber}
          />
          <Input
            name="lastName"
            label="Last name"
            placeholder="Rivera"
            autoComplete="family-name"
            error={errors.lastName}
          />
          <Input
            name="emailOrPhone"
            label="Email or phone"
            placeholder="you@company.com or +1 555 000 0000"
            error={errors.emailOrPhone}
          />
          <Button type="submit" size="lg" fullWidth loading={loading}>
            Find booking
          </Button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {status ? (
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Order number
                </p>
                <h3 className="mt-1 font-mono text-2xl font-black text-[#0B1120]">
                  {status.orderNumber}
                </h3>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                {status.status}
              </span>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Service
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {status.title}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Requested start
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatDate(status.requestedStartAt)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Customer
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {status.customerName}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Facility
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {status.facility?.name ?? "Not provided"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-amber-700" />
                <div>
                  <p className="text-sm font-bold text-slate-900">Next step</p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">
                    {status.nextStep}
                  </p>
                </div>
              </div>
            </div>

            {status.workOrders.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-900">
                  Linked work orders
                </p>
                <div className="mt-3 space-y-2">
                  {status.workOrders.map((workOrder) => (
                    <div
                      key={workOrder.workOrderNumber}
                      className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm"
                    >
                      <span className="font-mono font-semibold text-slate-900">
                        {workOrder.workOrderNumber}
                      </span>
                      <span className="font-medium text-slate-500">
                        {workOrder.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {status.timeline.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-semibold text-slate-900">
                  Status timeline
                </p>
                <div className="mt-3 space-y-3">
                  {status.timeline.map((event, index) => (
                    <div
                      key={`${event.statusCode}-${event.at}-${index}`}
                      className="flex gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                    >
                      <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-sky-50 text-sky-600">
                        {index === status.timeline.length - 1 ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <Circle className="h-3 w-3 fill-current" />
                        )}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <p className="text-sm font-semibold text-slate-900">
                            {event.status}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatDate(event.at)}
                          </p>
                        </div>
                        {event.note && (
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {event.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full min-h-80 flex-col items-center justify-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Clock3 className="h-7 w-7" />
            </span>
            <h3 className="mt-5 text-xl font-semibold text-slate-900">
              Status appears here
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              We only show booking details when the order number and requester
              verification match.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
