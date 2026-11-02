"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Compass, RefreshCw } from "lucide-react";
import { TravelShell } from "@/features/travel/components/travel-shell";
import { useTripBrief, useTripSights } from "../hooks/use-trip";
import { paramsFromQuery, queryFromParams, type TripQuery } from "../lib/query";
import type { TravelMode, TripBrief } from "../types";
import { AirportsCard } from "./airports-card";
import { BeforeYouFlyCard, BookCard } from "./book-card";
import { ConditionsCard } from "./conditions-card";
import { EssentialsCard } from "./essentials-card";
import { HealthCard } from "./health-card";
import { SafetyCard } from "./safety-card";
import { SightsCard } from "./sights-card";
import { TripPlanner } from "./trip-planner";
import { TripSkeleton } from "./trip-skeleton";
import { VerdictBanner } from "./verdict-banner";

type CardKey = "safety" | "health" | "conditions" | "essentials" | "airports" | "sights" | "book" | "before";

/** What matters first depends on why you're going. */
const ORDER: Record<TravelMode, CardKey[]> = {
  business: ["safety", "health", "essentials", "airports", "conditions", "book", "sights", "before"],
  leisure: ["safety", "sights", "conditions", "essentials", "airports", "book", "health", "before"],
};

const DEFAULTS: Omit<TripQuery, "name" | "cc" | "lat" | "lon"> = { home: "USD", mode: "leisure" };

export function TripExperience() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = useMemo(() => queryFromParams(new URLSearchParams(searchParams.toString())), [searchParams]);
  const [draftMode, setDraftMode] = useState<TravelMode>("leisure");
  const mode = query?.mode ?? draftMode;

  const brief = useTripBrief(query);
  const sights = useTripSights(query);

  const onChange = useCallback(
    (patch: Partial<TripQuery>) => {
      if (!query && !patch.cc) {
        // Mode (or anything else) chosen before a destination: remember it for when one is picked.
        if (patch.mode) setDraftMode(patch.mode);
        return;
      }
      const base = query ?? ({ ...DEFAULTS, mode: draftMode } as TripQuery);
      const next: TripQuery = { ...base, ...patch };
      router.replace(`/trip?${paramsFromQuery(next).toString()}`, { scroll: false });
    },
    [query, draftMode, router]
  );

  const renderCard = (key: CardKey, data: TripBrief) => {
    switch (key) {
      case "safety":
        return <SafetyCard brief={data} />;
      case "health":
        return <HealthCard brief={data} />;
      case "conditions":
        return <ConditionsCard brief={data} />;
      case "essentials":
        return <EssentialsCard brief={data} />;
      case "airports":
        return <AirportsCard brief={data} />;
      case "sights":
        return <SightsCard section={sights.data} loading={sights.isLoading} />;
      case "book":
        return <BookCard brief={data} mode={mode} />;
      case "before":
        return <BeforeYouFlyCard />;
    }
  };

  return (
    <TravelShell
      icon={Compass}
      title="Trip Brief"
      intro="Know before you go. Official advisories, health notices, live hazards, the forecast and what to see, for business or leisure, in one place."
    >
        <TripPlanner query={query} mode={mode} onChange={onChange} />

        {query === null ? (
          <p className="text-sm text-muted">
            Pick a destination to see its brief. Everything here comes from free public sources, and each section says where it came from.
          </p>
        ) : brief.isLoading ? (
          <TripSkeleton />
        ) : brief.isError || !brief.data ? (
          <div role="alert" className="dock-panel flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center">
            <AlertCircle className="h-6 w-6 text-alert" aria-hidden />
            <p className="text-base font-medium text-foreground">Couldn&apos;t build this brief</p>
            <p className="max-w-md text-sm text-muted">Something went wrong reaching our data sources. This usually clears up on its own.</p>
            <button
              type="button"
              onClick={() => void brief.refetch()}
              className="mt-1 inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-foreground transition-colors hover:border-accent/50 hover:text-accent active:scale-95"
            >
              <RefreshCw className="h-4 w-4" aria-hidden /> Try again
            </button>
          </div>
        ) : (
          <>
            <VerdictBanner brief={brief.data} />
            {/* Columns flow top to bottom, so tall and short cards balance without gaps; priority order reads down the left first. */}
            <div className="gap-4 lg:columns-2">
              {ORDER[mode].map((key) => (
                <div key={key} className="mb-4 break-inside-avoid">
                  {renderCard(key, brief.data)}
                </div>
              ))}
            </div>
          </>
        )}
    </TravelShell>
  );
}
