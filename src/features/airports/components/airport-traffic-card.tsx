import Link from "next/link";
import { PlaneLanding, PlaneTakeoff, Radar } from "lucide-react";
import { TripCard, Unavailable } from "@/features/trip/components/trip-card";
import type { AirportBrief } from "../types";

function Stat({ icon: Icon, label, value }: { icon: typeof PlaneLanding; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <dt className="flex items-center gap-1.5 text-xs text-muted">
        <Icon className="h-3.5 w-3.5" aria-hidden /> {label}
      </dt>
      <dd className="mt-1 font-mono text-xl font-semibold tabular-nums text-foreground">{value}</dd>
    </div>
  );
}

export function AirportTrafficCard({ brief, className }: { brief: AirportBrief; className?: string }) {
  const { traffic } = brief;

  return (
    <TripCard id="airport-traffic" icon={Radar} title="Live traffic" className={className}>
      {traffic.status === "unavailable" ? (
        <Unavailable reason={traffic.reason} />
      ) : (
        <div className="flex flex-col gap-4">
          <dl className="grid grid-cols-3 gap-2.5">
            <Stat icon={PlaneLanding} label="Arriving" value={traffic.data.arriving} />
            <Stat icon={PlaneTakeoff} label="Departing" value={traffic.data.departing} />
            <Stat icon={Radar} label="On ground" value={traffic.data.onGround} />
          </dl>

          {traffic.data.samples.length > 0 ? (
            <ul className="flex flex-col">
              {traffic.data.samples.map((s) => (
                <li key={s.callsign} className="border-t border-border first:border-t-0">
                  <Link
                    href={`/flights?q=${encodeURIComponent(s.callsign)}`}
                    className="flex min-h-11 items-center justify-between gap-3 py-2 text-sm transition-colors hover:text-accent"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {s.phase === "arriving" ? <PlaneLanding className="h-3.5 w-3.5 text-muted" aria-label="Arriving" /> : <PlaneTakeoff className="h-3.5 w-3.5 text-muted" aria-label="Departing" />}
                      <span className="shrink-0 font-mono font-medium text-foreground">{s.callsign}</span>
                      {s.aircraft && <span className="truncate text-xs text-muted">{s.aircraft}</span>}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted">
                      {s.altitudeFt !== null ? `${s.altitudeFt.toLocaleString()} ft` : ""} {s.speedKt !== null ? `· ${s.speedKt} kt` : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No arrivals or departures are in the air near {brief.airport.iata} right now.</p>
          )}

          <p className="text-xs leading-relaxed text-muted">
            Aircraft within {traffic.data.radiusNm}{" "}nautical miles, from community ADS-B receivers. Tap one to track it. Coverage varies, and some
            military and small aircraft don&apos;t appear{traffic.data.capped ? ", and this busy airspace was capped, so counts may be low" : ""}.
          </p>
        </div>
      )}
    </TripCard>
  );
}
