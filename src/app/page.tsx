import type { Metadata } from "next";
import { Landing } from "@/features/landing/components/landing";

export const metadata: Metadata = {
  title: "TerraScope AI: know what's happening before you go",
  description:
    "Live hazards, government travel advisories, weather and airport conditions for any trip. Every fact shows its source, and anything we couldn't check is clearly marked.",
};

export default function Home() {
  return <Landing />;
}
