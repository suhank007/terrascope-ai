import Link from "next/link";
import { ArrowUpRight, Info, MapPin, Plane } from "lucide-react";
import { formatDuration } from "@/features/airports/lib/format";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { compassPoint, formatAltitude, verticalTrend } from "../lib/format";
import type { AirportRef, FlightTrack, TrackStatus } from "../types";

const STATUS: Record<TrackStatus, { label: string; className: string }> = {
  airborne: { label: "In the air", className: "border-accent/30 bg-accent-soft text-accent" },
  "on-ground": { label: "On the ground", className: "border-border bg-surface-elevated text-foreground" },
  "not-tracking": { label: "Not being tracked right now", className: "border-alert/30 bg-alert/10 text-alert" },
  "not-found": { label: "Not found", className: "border-border bg-surface-elevated text-muted" },
};

function Endpoint({ airport, align }: { airport: AirportRef | null; align: "left" | "right" }) {
  if (!airport) return <div className={align === "right" ? "text-right" : ""}><span className="font-mono text-2xl text-muted">—</span></div>;
  return (
    <Link href={`/airports/${airport.iata}`} className={cn("group block min-w-0", align === "right" && "text-right")} title={`${airport.name}: live conditions`}>
      <span className="block font-mono text-3xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent">{airport.iata}</span>
      <span className="block truncate text-sm text-muted">{airport.city || airport.name}</span>
    </Link>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground">{children}</dd>
    </div>
  );
}

export function FlightResult({ track }: { track: FlightTrack }) {
  const { live, progress, origin, destination } = track;
  const status = STATUS[track.status];
  const title = track.flightNumber ?? track.callsign ?? track.query;

  return (
    <div className="flex flex-col gap-4">
      <section aria-labelledby="flight-heading" className="dock-panel rounded-2xl p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
              {track.airline ? track.airline.name : "Flight"}
              {track.callsign && track.callsign !== title ? ` · callsign ${track.callsign}` : ""}
            </p>
            <h2 id="flight-heading" className="mt-2 font-mono text-4xl font-semibold tracking-tight text-foreground">
              {title}
            </h2>
          </div>
          <span className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium", status.className)}>
            {track.status === "airborne" && <span className="h-1.5 w-1.5 animate-pulse-ring rounded-full bg-accent" aria-hidden />}
            {status.label}
          </span>
        </div>

        {(origin || destination) && (
          <div className="mt-6">
            <div className="flex items-end justify-between gap-4">
              <Endpoint airport={origin} align="left" />
              <Endpoint airport={destination} align="right" />
            </div>

            {progress && progress.percent !== null && (
              <div className="mt-4">
                <div className="relative h-8" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent} aria-label="Distance flown">
                  <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-border" />
                  <div className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-accent" style={{ width: `${progress.percent}%` }} />
                  <span
                    className="absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent/40 bg-surface text-accent"
                    style={{ left: `${Math.min(97, Math.max(3, progress.percent))}%` }}
                  >
                    <Plane className="h-4 w-4 rotate-45" aria-hidden />
                  </span>
                </div>
                <p className="mt-2 flex justify-between text-xs text-muted">
                  <span>{(progress.totalKm - progress.remainingKm).toLocaleString()} km flown</span>
                  <span>{progress.remainingKm.toLocaleString()} km to go</span>
                </p>
              </div>
            )}
          </div>
        )}

        {progress?.etaMinutes != null && (
          <p className="mt-4 text-sm text-foreground">
            About <span className="font-semibold">{formatDuration(progress.etaMinutes)}</span> to go at the current speed.{" "}
            <span className="text-muted">A straight-line estimate, not the airline&apos;s arrival time.</span>
          </p>
        )}
        {progress?.offRoute && (
          <p role="status" className="mt-4 flex items-start gap-2 text-sm text-alert">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            This aircraft isn&apos;t near the route we have for this flight number, so the route may be out of date or the flight diverted.
          </p>
        )}

        {track.status === "not-tracking" && (
          <p className="mt-4 text-sm leading-relaxed text-muted">
            No aircraft is transmitting under {track.callsign ?? track.query} right now. It may not have departed yet, may have already landed, or
            may be out of range of a receiver. The route above is the one usually flown under this number.
          </p>
        )}
        {track.status === "not-found" && (
          <div className="mt-4 text-sm leading-relaxed text-muted">
            <p>We couldn&apos;t find anything for {track.query}. Check the number, or try:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>the airline&apos;s callsign form (BAW117 instead of BA117),</li>
              <li>the aircraft&apos;s registration, such as G-BODO or N12345.</li>
            </ul>
          </div>
        )}
      </section>

      {live && (
        <section aria-labelledby="live-heading" className="dock-panel rounded-2xl p-5">
          <h2 id="live-heading" className="mb-3 text-sm font-medium text-foreground">
            Live position
          </h2>
          <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            <Fact label="Altitude">{formatAltitude(live.altitudeFt, live.onGround)}</Fact>
            <Fact label="Ground speed">{live.speedKt !== null ? `${live.speedKt} kt (${Math.round(live.speedKt * 1.852)} km/h)` : "—"}</Fact>
            <Fact label="Heading">{live.headingDeg !== null ? `${live.headingDeg}° ${compassPoint(live.headingDeg)}` : "—"}</Fact>
            <Fact label="Vertical">{verticalTrend(live.verticalFpm) ?? "—"}</Fact>
            <Fact label="Aircraft">{live.aircraft ?? "—"}</Fact>
            <Fact label="Registration">{live.registration ?? "—"}</Fact>
            <Fact label="Last heard">{formatRelativeTime(live.lastSeen)}</Fact>
            <Fact label="Position">
              {live.latitude.toFixed(2)}, {live.longitude.toFixed(2)}
            </Fact>
          </dl>
          <a
            href={`https://www.openstreetmap.org/?mlat=${live.latitude}&mlon=${live.longitude}#map=7/${live.latitude}/${live.longitude}`}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium text-foreground transition-colors hover:border-accent/50 hover:text-accent"
          >
            <MapPin className="h-4 w-4" aria-hidden /> Open on a map <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </section>
      )}

      <section aria-labelledby="limits-heading" className="rounded-2xl border border-dashed border-border p-5">
        <h2 id="limits-heading" className="text-sm font-medium text-foreground">
          What this can and can&apos;t tell you
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          You&apos;re seeing where the aircraft actually is, from community ADS-B receivers. TerraScope doesn&apos;t have airline schedules (they need a
          paid data source), so it can&apos;t say whether a flight is late or when it was due to leave. Check your airline for scheduled times. The
          route comes from a community database and can be out of date.
        </p>
      </section>
    </div>
  );
}
