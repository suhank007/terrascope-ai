import type { Metadata } from "next";
import { Landing } from "@/features/landing/components/landing";

export const metadata: Metadata = {
  title: "TerraScope AI: know what's happening before you go",
  description:
    "Live hazards, government advisories, weather and airport conditions for any trip, with the source for every line and a clear note of what could not be checked.",
};

export default function Home() {
  return <Landing />;
}
