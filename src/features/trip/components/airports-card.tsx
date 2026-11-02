import Link from "next/link";
import { ChevronRight, PlaneTakeoff } from "lucide-react";
import type { TripBrief } from "../types";
import { TripCard } from "./trip-card";

export function AirportsCard({ brief, className }: { brief: TripBrief; className?: string }) {
  const { airports, destination } = brief;

  return (
    <TripCard id="airports" icon={PlaneTakeoff} title="Airports nearby" className={className}>
      {airports.length === 0 ? (
        <p className="text-sm text-muted">No airport with scheduled flights was found within 150 km of {destination.name}.</p>
      ) : (
        <>
          <ul className="flex flex-col">
            {airports.map((a) => (
              <li key={a.iata} className="border-t border-border first:border-t-0">
                <Link href={`/airports/${a.iata}`} className="group flex min-h-12 items-center gap-3 py-2.5">
                  <span className="w-11 shrink-0 font-mono text-base font-semibold text-foreground transition-colors group-hover:text-accent">{a.iata}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-foreground">{a.name}</span>
                    <span className="block text-xs text-muted">{a.distanceKm} km from the centre</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-muted">Open one for live weather, delays and traffic.</p>
        </>
      )}
    </TripCard>
  );
}
