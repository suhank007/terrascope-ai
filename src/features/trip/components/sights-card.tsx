"use client";

import { useState } from "react";
import { Landmark, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Section, Sight, SightCategory } from "../types";
import { TripCard, Unavailable } from "./trip-card";

const FILTERS: { key: SightCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "culture", label: "Culture" },
  { key: "landmark", label: "Landmarks" },
  { key: "outdoors", label: "Outdoors" },
  { key: "viewpoint", label: "Viewpoints" },
];

const CATEGORY_LABEL: Record<SightCategory, string> = { culture: "Culture", landmark: "Landmark", outdoors: "Outdoors", viewpoint: "Viewpoint" };

export function SightsCard({ section, loading, className }: { section: Section<Sight[]> | undefined; loading: boolean; className?: string }) {
  const [filter, setFilter] = useState<SightCategory | "all">("all");
  const sights = section?.status === "ok" ? section.data : [];
  const visible = filter === "all" ? sights : sights.filter((s) => s.category === filter);
  const counts = (key: SightCategory | "all") => (key === "all" ? sights.length : sights.filter((s) => s.category === key).length);

  return (
    <TripCard id="sights" icon={Landmark} title="Top things to see" className={className}>
      {loading ? (
        <ul aria-busy="true" aria-label="Loading places" className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3" aria-hidden>
              <span className="skeleton-shimmer h-8 w-8 shrink-0 rounded-lg bg-surface-elevated" />
              <span className="flex-1 space-y-2">
                <span className="skeleton-shimmer block h-3 w-2/3 rounded bg-surface-elevated" />
                <span className="skeleton-shimmer block h-2.5 w-1/2 rounded bg-surface-elevated" />
              </span>
            </li>
          ))}
        </ul>
      ) : !section || section.status === "unavailable" ? (
        <Unavailable reason={section?.status === "unavailable" ? section.reason : "Places couldn't be loaded."} />
      ) : sights.length === 0 ? (
        <p className="text-sm text-muted">No widely documented sights were found near this point. Try a larger city nearby.</p>
      ) : (
        <>
          <div role="group" aria-label="Filter by type" className="mb-4 flex flex-wrap gap-1.5">
            {FILTERS.filter((f) => f.key === "all" || counts(f.key) > 0).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors active:scale-95",
                  filter === f.key ? "border-accent/40 bg-accent-soft text-accent" : "border-border text-muted hover:text-foreground"
                )}
              >
                {f.label} <span className="font-mono text-[10px] opacity-70">{counts(f.key)}</span>
              </button>
            ))}
          </div>

          <ol className="flex flex-col">
            {visible.map((sight, i) => (
              <li key={sight.id} className="flex items-start gap-3 border-t border-border py-3 first:border-t-0 first:pt-0">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background/40 font-mono text-xs text-muted">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{sight.name}</p>
                  <p className="line-clamp-2 text-xs leading-relaxed text-muted">{sight.description}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <span className="rounded-full bg-surface-elevated px-2 py-0.5 text-muted">{CATEGORY_LABEL[sight.category]}</span>
                    <span className="text-muted">{sight.distanceKm} km from centre</span>
                    <a href={sight.url} target="_blank" rel="noreferrer" className="font-medium text-accent hover:underline">
                      Read more ↗
                    </a>
                    <a href={sight.mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-accent hover:underline">
                      <MapPin className="h-3 w-3" aria-hidden /> Map ↗
                    </a>
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted">
            Ranked by how many Wikipedia languages cover each place, a free stand-in for fame. It is not a review score: ratings and restaurant
            rankings need a paid source.
          </p>
        </>
      )}
    </TripCard>
  );
}
