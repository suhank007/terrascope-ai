import Link from "next/link";
import { Info, Plane } from "lucide-react";
import { Facts } from "@/components/ui/facts";
import { TripCard } from "@/features/trip/components/trip-card";
import { formatDuration } from "@/features/airports/lib/format";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { compassPoint, formatAltitude, verticalTrend } from "../lib/format";
import type { AirportRef, FlightTrack, TrackStatus } from "../types";

const STATUS: Record<TrackStatus, { label: string; dot: string; text: string }> = {
  airborne: { label: "In the air", dot: "bg-accent", text: "text-accent" },
  "on-ground": { label: "On the ground", dot: "bg-foreground", text: "text-foreground" },
  "not-tracking": { label: "Not being tracked right now", dot: "bg-alert", text: "text-alert" },
  "not-found": { label: "Not found", dot: "bg-muted", text: "text-muted" },
};

function Endpoint({ airport, align }: { airport: AirportRef | null; align: "left" | "right" }) {
  if (!airport) return <div className={align === "right" ? "text-right" : ""}><span className="font-mono text-2xl text-muted">Unknown</span></div>;
  return (
    <Link href={`/airports/${airport.iata}`} className={cn("group block min-w-0", align === "right" && "text-right")} title={`${airport.name}: live conditions`}>
      <span className="block font-mono text-3xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-accent">{airport.iata}</span>
      <span className="block truncate text-sm text-muted">{airport.city || airport.name}</span>
    </Link>
  );
}

export function FlightResult({ track }: { track: FlightTrack }) {
  const { live, progress, origin, destination } = track;
  const status = STATUS[track.status];
  const title = track.flightNumber ?? track.callsign ?? track.query;

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="flight-heading" className="dock-panel rounded-2xl p-6">
        <p className="text-sm text-muted">
          {track.airline ? track.airline.name : "Flight"}
          {track.callsign && track.callsign !== title ? ` · callsign ${track.callsign}` : ""}
        </p>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 id="flight-heading" className="font-mono text-3xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <span className={cn("inline-flex items-center gap-2 text-sm font-medium", status.text)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot, track.status === "airborne" && "animate-pulse-ring")} aria-hidden />
            {status.label}
          </span>
        </div>

        {(origin || destination) && (
          <div className="mt-7">
            <div className="flex items-end justify-between gap-4">
              <Endpoint airport={origin} align="left" />
              <Endpoint airport={destination} align="right" />
            </div>

            {progress && progress.percent !== null && (
              <div className="mt-5">
                <div className="relative h-7" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent} aria-label="Distance flown">
                  <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
                  <div className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-accent" style={{ width: `${progress.percent}%` }} />
                  <span
                    className="absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-accent"
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
          <p className="mt-5 text-sm text-foreground">
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
          <p className="mt-5 max-w-prose text-sm leading-relaxed text-muted">
            No aircraft is transmitting under {track.callsign ?? track.query} right now. It may not have departed yet, may have already landed, or may be out of range of a receiver.
            The route above is the one usually flown under this number.
          </p>
        )}
        {track.status === "not-found" && (
          <div className="mt-5 max-w-prose text-sm leading-relaxed text-muted">
            <p>We couldn&apos;t find anything for {track.query}. Check the number, or try the airline&apos;s callsign (BAW117 instead of BA117) or the aircraft&apos;s registration, such as G-BODO or N12345.</p>
          </div>
        )}
      </section>

      {live && (
        <TripCard id="live" title="Live position">
          <Facts
            columns={2}
            items={[
              { label: "Altitude", value: formatAltitude(live.altitudeFt, live.onGround) },
              { label: "Ground speed", value: live.speedKt !== null ? `${live.speedKt} kt (${Math.round(live.speedKt * 1.852)} km/h)` : "Not reported" },
              { label: "Heading", value: live.headingDeg !== null ? `${live.headingDeg}° ${compassPoint(live.headingDeg)}` : "Not reported" },
              { label: "Vertical", value: verticalTrend(live.verticalFpm) ?? "Not reported" },
              { label: "Aircraft", value: live.aircraft ?? "Not reported" },
              { label: "Registration", value: live.registration ?? "Not reported" },
              { label: "Last heard", value: formatRelativeTime(live.lastSeen) },
              { label: "Position", value: `${live.latitude.toFixed(2)}, ${live.longitude.toFixed(2)}` },
            ]}
          />
          <a
            href={`https://www.openstreetmap.org/?mlat=${live.latitude}&mlon=${live.longitude}#map=7/${live.latitude}/${live.longitude}`}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-4 inline-flex min-h-10 items-center text-sm font-medium text-accent hover:underline"
          >
            Open on a map ↗
          </a>
        </TripCard>
      )}

      <p className="max-w-prose text-xs leading-relaxed text-muted">
        What this can and can&apos;t tell you: you&apos;re seeing where the aircraft actually is, from community ADS-B receivers. TerraScope doesn&apos;t have airline schedules
        (they need a paid data source), so it can&apos;t say whether a flight is late. Check your airline for scheduled times. The route comes from a community database and can
        be out of date.
      </p>
    </div>
  );
}
