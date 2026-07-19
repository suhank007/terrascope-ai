import { ArrowUpRight, Gauge, Navigation, TrendingUp } from "lucide-react";
import type { Flight } from "../types";
import { formatAltitudeFt, formatRelativeTime, formatSpeedKt } from "@/lib/format";

export function FlightPanelContent({ data }: { data: Flight }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-accent">
          <ArrowUpRight className="h-5 w-5" style={{ rotate: `${data.trueTrack ?? 45}deg` }} />
        </span>
        <div>
          <p className="text-base font-medium text-foreground">{data.callsign ?? data.icao24.toUpperCase()}</p>
          <p className="text-xs text-muted">{data.aircraftType ?? data.icao24.toUpperCase()}</p>
        </div>
      </div>

      {data.onGround && (
        <div className="rounded-lg border border-border bg-surface-elevated/40 px-3 py-2 text-xs text-muted">
          On ground
        </div>
      )}

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-border bg-surface-elevated/40 p-3">
          <dt className="flex items-center gap-1 text-xs text-muted">
            <TrendingUp className="h-3 w-3" /> Altitude
          </dt>
          <dd className="mt-1 font-medium text-foreground">{formatAltitudeFt(data.altitudeM)}</dd>
        </div>
        <div className="rounded-lg border border-border bg-surface-elevated/40 p-3">
          <dt className="flex items-center gap-1 text-xs text-muted">
            <Gauge className="h-3 w-3" /> Speed
          </dt>
          <dd className="mt-1 font-medium text-foreground">{formatSpeedKt(data.velocityMs)}</dd>
        </div>
        <div className="rounded-lg border border-border bg-surface-elevated/40 p-3">
          <dt className="flex items-center gap-1 text-xs text-muted">
            <Navigation className="h-3 w-3" /> Heading
          </dt>
          <dd className="mt-1 font-medium text-foreground">
            {data.trueTrack !== null ? `${Math.round(data.trueTrack)}°` : "—"}
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-surface-elevated/40 p-3">
          <dt className="text-xs text-muted">Last contact</dt>
          <dd className="mt-1 font-medium text-foreground">{formatRelativeTime(data.lastContact)}</dd>
        </div>
      </dl>
    </div>
  );
}
