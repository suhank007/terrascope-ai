import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { TripBrief } from "../types";
import { TripCard } from "./trip-card";

export function AirportsCard({ brief, className }: { brief: TripBrief; className?: string }) {
  const { airports, destination } = brief;

  return (
    <TripCard id="airports" title="Airports nearby" className={className}>
      {airports.length === 0 ? (
        <p className="text-sm text-muted">No airport with scheduled flights was found within 150 km of {destination.name}.</p>
      ) : (
        <>
          <ul>
            {airports.map((a) => (
              <li key={a.iata}>
                <Link href={`/airports/${a.iata}`} className="group flex min-h-12 items-center gap-4 border-b border-border/60 py-2">
                  <span className="w-10 shrink-0 font-mono text-sm font-semibold text-foreground transition-colors group-hover:text-accent">{a.iata}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-foreground">{a.name}</span>
                    <span className="block text-xs text-muted">{a.distanceKm} km from the centre</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-accent" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted">Open one for live weather, delays and traffic.</p>
        </>
      )}
    </TripCard>
  );
}
