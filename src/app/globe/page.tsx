import type { Metadata } from "next";
import { GlobeExperience } from "@/features/globe/components/globe-experience";

export const metadata: Metadata = {
  title: "Live globe | TerraScope AI",
  description: "Earthquakes, wildfires, weather, air quality and live flights on one 3D globe, with an AI copilot that answers against the live data.",
};

export default function GlobePage() {
  return <GlobeExperience />;
}
