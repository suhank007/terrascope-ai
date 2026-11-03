"use client";

import Link from "next/link";
import { LoopClip } from "@/components/ui/loop-clip";
import { TravelShell } from "@/features/travel/components/travel-shell";
import { HUBS } from "../lib/hubs";
import { AirportSearch } from "./airport-search";

export function AirportsIndex() {
  return (
    <TravelShell title="Airports" intro="Is the airport running normally right now? Live weather, FAA delay programmes for US airports, and the aircraft arriving and departing.">
      <section aria-label="Find an airport" className="dock-panel rounded-2xl p-5">
        <AirportSearch />
        <p className="mt-4 text-sm text-muted">
          Busy hubs:{" "}
          {HUBS.map((h, i) => (
            <span key={h.iata}>
              <Link href={`/airports/${h.iata}`} className="text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent">
                {h.city} <span className="font-mono text-xs text-muted">{h.iata}</span>
              </Link>
              {i < HUBS.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </section>
      <LoopClip kind="delay" caption="Illustration: how a delay shows up against the planned time. Not live data." className="max-w-3xl" />
      <p className="max-w-prose text-xs leading-relaxed text-muted">
        Weather comes from NOAA&apos;s Aviation Weather Center, delays from the FAA (US only), and aircraft from community ADS-B receivers. Outside the US there is no free
        public delay feed, so those airports show a weather-based outlook and say so.
      </p>
    </TravelShell>
  );
}
