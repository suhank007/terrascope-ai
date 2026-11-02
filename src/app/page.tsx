import type { Metadata } from "next";
import { Landing } from "@/features/landing/components/landing";

export const metadata: Metadata = {
  title: "TerraScope AI: every threat, delay and detour before you fly",
  description:
    "Live earthquakes, wildfires, weather and aircraft, government advisories and airport conditions, scored into one verdict that names its sources and says what it could not check.",
};

export default function Home() {
  return <Landing />;
}
