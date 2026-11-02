"use client";

import Link from "next/link";
import { AlertCircle, PlaneTakeoff, RefreshCw } from "lucide-react";
import { TravelShell } from "@/features/travel/components/travel-shell";
import { useAirportBrief } from "../hooks/use-airports";
import { AirportConditionsCard } from "./airport-conditions-card";
import { AirportDelaysCard } from "./airport-delays-card";
import { AirportLinksCard } from "./airport-links-card";
import { AirportSearch } from "./airport-search";
import { AirportTrafficCard } from "./airport-traffic-card";
import { OutlookBanner } from "./outlook-banner";

function Skeleton() {
  return (
    <div aria-busy="true" role="status" aria-label="Checking airport conditions" className="flex flex-col gap-4">
      <div className="dock-panel rounded-2xl p-6">
        <div className="skeleton-shimmer h-10 w-32 rounded bg-surface-elevated" />
        <div className="skeleton-shimmer mt-4 h-5 w-1/2 rounded bg-surface-elevated" />
        <p className="mt-5 text-xs text-muted">Checking weather, delay programmes and live traffic…</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="dock-panel rounded-2xl p-5">
            <div className="skeleton-shimmer h-4 w-1/3 rounded bg-surface-elevated" />
            <div className="mt-5 space-y-2.5">
              <div className="skeleton-shimmer h-3 w-full rounded bg-surface-elevated" />
              <div className="skeleton-shimmer h-3 w-3/4 rounded bg-surface-elevated" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AirportPage({ code }: { code: string }) {
  const { data, isLoading, isError, refetch } = useAirportBrief(code);

  return (
    <TravelShell
      icon={PlaneTakeoff}
      title="Airport"
      intro="Live weather, FAA delay programmes for US airports, and the aircraft arriving and departing right now."
    >
      <section aria-label="Find another airport" className="dock-panel rounded-2xl p-4 sm:p-5">
        <AirportSearch />
      </section>

      {isLoading ? (
        <Skeleton />
      ) : isError || !data ? (
        <div role="alert" className="dock-panel flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center">
          <AlertCircle className="h-6 w-6 text-alert" aria-hidden />
          <p className="text-base font-medium text-foreground">Couldn&apos;t load {code.toUpperCase()}</p>
          <p className="max-w-md text-sm text-muted">Something went wrong reaching our data sources. This usually clears up on its own.</p>
          <div className="mt-1 flex gap-2">
            <button type="button" onClick={() => void refetch()} className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-foreground transition-colors hover:border-accent/50 hover:text-accent active:scale-95">
              <RefreshCw className="h-4 w-4" aria-hidden /> Try again
            </button>
            <Link href="/airports" className="inline-flex h-10 items-center rounded-full border border-border px-4 text-sm text-muted transition-colors hover:text-foreground">
              Choose another
            </Link>
          </div>
        </div>
      ) : (
        <>
          <OutlookBanner brief={data} />
          <div className="gap-4 lg:columns-2">
            {[
              <AirportDelaysCard key="delays" brief={data} />,
              <AirportConditionsCard key="conditions" brief={data} />,
              <AirportTrafficCard key="traffic" brief={data} />,
              <AirportLinksCard key="links" airport={data.airport} />,
            ].map((card) => (
              <div key={card.key} className="mb-4 break-inside-avoid">
                {card}
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-muted">
            Weather: NOAA Aviation Weather Center. Delays: FAA National Airspace System status (US only). Aircraft: adsb.fi community receivers.
            Airport data: OurAirports. Refreshes every couple of minutes while this page is open.
          </p>
        </>
      )}
    </TravelShell>
  );
}
