import type { Metadata } from "next";
import { Suspense } from "react";
import { TripExperience } from "@/features/trip/components/trip-experience";

export const metadata: Metadata = {
  title: "Trip Brief — TerraScope AI",
  description:
    "Know before you go: official travel advisories, health notices, live hazards, the forecast and top sights for any destination, for business or leisure.",
};

export default function TripPage() {
  // useSearchParams needs a Suspense boundary so the page can still prerender.
  return (
    <Suspense fallback={null}>
      <TripExperience />
    </Suspense>
  );
}
