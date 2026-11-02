"use client";

import Link from "next/link";
import { PlaneTakeoff } from "lucide-react";
import { TravelShell } from "@/features/travel/components/travel-shell";
import { HUBS } from "../lib/hubs";
import { AirportSearch } from "./airport-search";

export function AirportsIndex() {
  return (
    <TravelShell
      icon={PlaneTakeoff}
      title="Airports"
      intro="Is the airport running normally right now? Live weather, FAA delay programmes for US airports, and the aircraft arriving and departing."
    >
      <section aria-label="Find an airport" className="dock-panel rounded-2xl p-4 sm:p-5">
        <AirportSearch />
        <div className="mt-4">
          <p className="mb-2 text-xs text-muted">Busy hubs:</p>
          <div className="flex flex-wrap gap-2">
            {HUBS.map((h) => (
              <Link
                key={h.iata}
                href={`/airports/${h.iata}`}
                className="flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm transition-colors hover:border-accent/50 hover:text-accent active:scale-95"
              >
                <span className="font-mono font-semibold text-foreground">{h.iata}</span>
                <span className="text-muted">{h.city}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <p className="text-xs leading-relaxed text-muted">
        Weather comes from NOAA&apos;s Aviation Weather Center, delays from the FAA (US only), and aircraft from community ADS-B receivers.
        Outside the US there is no free public delay feed, so those airports show a weather-based outlook and say so.
      </p>
    </TravelShell>
  );
}
