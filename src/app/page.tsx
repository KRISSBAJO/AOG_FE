import type { Metadata } from "next";
import FacilityHome from "@/components/landing/FacilityHome";

export const metadata: Metadata = {
  title: "AOG Services | Facility Solutions in Nashville, TN",
  description: "Cleaning, security, parking, event setup, and facility support. Connect with AOG Services in Nashville for a plan built around your facility.",
};

export default function Home() {
  return <FacilityHome />;
}
