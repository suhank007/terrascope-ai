import type { Metadata } from "next";
import { Suspense } from "react";
import { FlightsExperience } from "@/features/flight-tracker/components/flights-experience";

export const metadata: Metadata = {
  title: "Flight tracker | TerraScope AI",
  description: "Track a flight live by flight number, callsign or registration: position, altitude, speed and distance to go.",
};

export default function FlightsPage() {
  // useSearchParams needs a Suspense boundary so the page can still prerender.
  return (
    <Suspense fallback={null}>
      <FlightsExperience />
    </Suspense>
  );
}
