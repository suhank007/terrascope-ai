"use client";

import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { SectionLayout } from "@/features/travel/components/section-layout";
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
    <div aria-busy="true" role="status" aria-label="Checking airport conditions" className="flex flex-col gap-8">
      <div className="dock-panel rounded-2xl p-6">
        <div className="skeleton-shimmer h-8 w-28 rounded bg-surface-elevated" />
        <div className="skeleton-shimmer mt-4 h-5 w-1/2 rounded bg-surface-elevated" />
        <p className="mt-5 text-xs text-muted">Checking weather, delay programmes and live traffic.</p>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border-t border-border pt-8">
          <div className="skeleton-shimmer h-4 w-1/4 rounded bg-surface-elevated" />
          <div className="mt-5 space-y-2.5">
            <div className="skeleton-shimmer h-3.5 w-full rounded bg-surface-elevated" />
            <div className="skeleton-shimmer h-3.5 w-2/3 rounded bg-surface-elevated" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AirportPage({ code }: { code: string }) {
  const { data, isLoading, isError, refetch } = useAirportBrief(code);

  return (
    <TravelShell title="Airport" intro="Live weather, FAA delay programmes for US airports, and the aircraft arriving and departing right now.">
      <section aria-label="Find another airport" className="dock-panel rounded-2xl p-5">
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
        <div className="flex flex-col gap-10">
          <OutlookBanner brief={data} />
          <SectionLayout
            sections={[
              { id: "airport-delays", label: "Delays" },
              { id: "airport-conditions", label: "Conditions" },
              { id: "airport-traffic", label: "Traffic" },
              { id: "airport-links", label: "Getting around" },
            ]}
          >
            <AirportDelaysCard brief={data} />
            <AirportConditionsCard brief={data} />
            <AirportTrafficCard brief={data} />
            <AirportLinksCard airport={data.airport} />
            <div className="border-t border-border pt-6">
              <p className="max-w-prose text-xs leading-relaxed text-muted">
                Weather: NOAA Aviation Weather Center. Delays: FAA National Airspace System status (US only). Aircraft: adsb.fi community receivers. Airport data: OurAirports.
                Refreshes every couple of minutes while this page is open.
              </p>
            </div>
          </SectionLayout>
        </div>
      )}
    </TravelShell>
  );
}
