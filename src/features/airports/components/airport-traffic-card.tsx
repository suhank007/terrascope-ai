import Link from "next/link";
import { PlaneLanding, PlaneTakeoff } from "lucide-react";
import { TripCard, Unavailable } from "@/features/trip/components/trip-card";
import type { AirportBrief } from "../types";

function Count({ n, label }: { n: number; label: string }) {
  return (
    <span>
      <span className="font-mono text-base font-semibold tabular-nums text-foreground">{n}</span> <span className="text-muted">{label}</span>
    </span>
  );
}

export function AirportTrafficCard({ brief, className }: { brief: AirportBrief; className?: string }) {
  const { traffic } = brief;

  return (
    <TripCard id="airport-traffic" title="Live traffic" className={className}>
      {traffic.status === "unavailable" ? (
        <Unavailable reason={traffic.reason} />
      ) : (
        <div className="flex flex-col gap-4">
          <p className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <Count n={traffic.data.arriving} label="arriving" />
            <Count n={traffic.data.departing} label="departing" />
            <Count n={traffic.data.onGround} label="on the ground" />
          </p>

          {traffic.data.samples.length > 0 ? (
            <ul>
              {traffic.data.samples.map((s) => (
                <li key={s.callsign}>
                  <Link href={`/flights?q=${encodeURIComponent(s.callsign)}`} className="group flex min-h-11 items-center justify-between gap-3 border-b border-border/60 py-2 text-sm">
                    <span className="flex min-w-0 items-center gap-3">
                      {s.phase === "arriving" ? <PlaneLanding className="h-4 w-4 shrink-0 text-muted" aria-label="Arriving" /> : <PlaneTakeoff className="h-4 w-4 shrink-0 text-muted" aria-label="Departing" />}
                      <span className="shrink-0 font-mono font-medium text-foreground transition-colors group-hover:text-accent">{s.callsign}</span>
                      {s.aircraft && <span className="truncate text-muted">{s.aircraft}</span>}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted">
                      {s.altitudeFt !== null ? `${s.altitudeFt.toLocaleString()} ft` : ""}
                      {s.speedKt !== null ? ` · ${s.speedKt} kt` : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No arrivals or departures are in the air near {brief.airport.iata} right now.</p>
          )}

          <p className="max-w-prose text-xs leading-relaxed text-muted">
            Aircraft within {traffic.data.radiusNm}{" "}nautical miles, from community ADS-B receivers. Tap one to track it. Coverage varies, and some military and small aircraft
            don&apos;t appear{traffic.data.capped ? ", and this busy airspace was capped, so counts may be low" : ""}.
          </p>
        </div>
      )}
    </TripCard>
  );
}
