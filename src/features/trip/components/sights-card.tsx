"use client";

import { useState } from "react";
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
    <TripCard id="sights" title="Top things to see" className={className}>
      {loading ? (
        <ul aria-busy="true" aria-label="Loading places" className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="space-y-2" aria-hidden>
              <span className="skeleton-shimmer block h-3.5 w-2/5 rounded bg-surface-elevated" />
              <span className="skeleton-shimmer block h-3 w-3/5 rounded bg-surface-elevated" />
            </li>
          ))}
        </ul>
      ) : !section || section.status === "unavailable" ? (
        <Unavailable reason={section?.status === "unavailable" ? section.reason : "Places couldn't be loaded."} />
      ) : sights.length === 0 ? (
        <p className="text-sm text-muted">No widely documented sights were found near this point. Try a larger city nearby.</p>
      ) : (
        <>
          <div role="group" aria-label="Filter by type" className="-ml-3 mb-2 flex flex-wrap gap-1">
            {FILTERS.filter((f) => f.key === "all" || counts(f.key) > 0).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
                className={cn("h-9 rounded-full px-3 text-sm transition-colors", filter === f.key ? "bg-surface-elevated font-medium text-foreground" : "text-muted hover:text-foreground")}
              >
                {f.label} <span className="text-xs text-muted">{counts(f.key)}</span>
              </button>
            ))}
          </div>

          <ol>
            {visible.map((sight, i) => (
              <li key={sight.id} className="flex gap-4 border-t border-border/60 py-4 first:border-t-0">
                <span className="w-5 shrink-0 pt-0.5 text-right font-mono text-sm text-muted">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{sight.name}</p>
                  <p className="line-clamp-2 max-w-prose text-sm leading-relaxed text-muted">{sight.description}</p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                    <span>{CATEGORY_LABEL[sight.category]}</span>
                    <span>{sight.distanceKm} km from centre</span>
                    <a href={sight.url} target="_blank" rel="noreferrer noopener" className="text-accent hover:underline">
                      Read more ↗
                    </a>
                    <a href={sight.mapUrl} target="_blank" rel="noreferrer noopener" className="text-accent hover:underline">
                      Map ↗
                    </a>
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-3 max-w-prose text-xs leading-relaxed text-muted">
            Ranked by how many Wikipedia languages cover each place, a free stand-in for fame. It is not a review score: ratings and restaurant rankings need a paid source.
          </p>
        </>
      )}
    </TripCard>
  );
}
