"use client";

import Link from "next/link";
import { LoopClip } from "@/components/ui/loop-clip";
import { TravelShell } from "@/features/travel/components/travel-shell";
import { HUBS } from "../lib/hubs";
import { AirportSearch } from "./airport-search";

export function AirportsIndex() {
  return (
    <TravelShell title="Airports" intro="Is the airport running normally right now? Live weather, FAA delays for US airports, and the aircraft arriving and departing.">
      <section aria-label="Find an airport" className="dock-panel rounded-2xl p-5">
        <AirportSearch />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Busy hubs</span>
          {HUBS.map((h) => (
            <Link key={h.iata} href={`/airports/${h.iata}`} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-sm text-foreground transition-colors hover:border-accent/50 hover:text-accent active:scale-95 sm:min-h-9 sm:px-3.5">
              {h.city} <span className="font-mono text-xs text-muted">{h.iata}</span>
            </Link>
          ))}
        </div>
      </section>
      <LoopClip kind="delay" caption="Illustration: how a delay shows up against the planned time. Not live data." className="max-w-3xl" />
      <p className="max-w-prose text-xs leading-relaxed text-muted">
        Weather comes from NOAA&apos;s Aviation Weather Center, delays from the FAA (US only), and aircraft from community ADS-B receivers. Outside the US there is no free
        public delay feed, so those airports show a weather-based outlook and say so.
      </p>
    </TravelShell>
  );
}
