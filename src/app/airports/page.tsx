import type { Metadata } from "next";
import { AirportsIndex } from "@/features/airports/components/airports-index";

export const metadata: Metadata = {
  title: "Airports: live conditions and delays — TerraScope AI",
  description: "Is the airport running normally? Live weather, FAA delay programmes for US airports, and arriving and departing aircraft.",
};

export default function AirportsPage() {
  return <AirportsIndex />;
}
