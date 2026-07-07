import type { Metadata } from "next";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import BookingStatusLookup from "@/components/landing/BookingStatusLookup";

export const metadata: Metadata = {
  title: "Booking Status | AOG Services",
  description:
    "Check the public status of an AOG Services booking with your order number and requester verification.",
};

export default function BookingStatusPage() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1">
        <section className="bg-[#0B1120] py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <span className="text-sm font-semibold uppercase tracking-wide text-amber-300">
              Booking status
            </span>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Track a service request
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Enter the order number from your confirmation along with the last
              name and email or phone number used to submit the booking.
            </p>
          </div>
        </section>

        <section className="bg-slate-50 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <BookingStatusLookup />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
