import { Clock } from "lucide-react";
import { SeverityPill, TripCard, Unavailable } from "@/features/trip/components/trip-card";
import { formatDuration } from "../lib/format";
import type { AirportBrief } from "../types";

export function AirportDelaysCard({ brief, className }: { brief: AirportBrief; className?: string }) {
  const { faa, airport } = brief;

  return (
    <TripCard id="airport-delays" icon={Clock} title="Delays and status" className={className}>
      {faa === null ? (
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted">
          <p>
            <span className="text-foreground">There is no free public delay feed for airports outside the US.</span> The FAA publishes live
            ground stops and delay programmes for US airports only, so for {airport.iata} the outlook above is based on weather.
          </p>
          <p>
            For the delay on a specific flight, check your airline or{" "}
            {airport.website ? (
              <a href={airport.website} target="_blank" rel="noreferrer noopener" className="text-accent hover:underline">
                the airport&apos;s own site ↗
              </a>
            ) : (
              "the airport's own site"
            )}
            . Airline schedules need a paid data source, so TerraScope doesn&apos;t show them.
          </p>
        </div>
      ) : faa.status === "unavailable" ? (
        <Unavailable reason={faa.reason} />
      ) : (
        <div className="flex flex-col gap-4">
          {!faa.data.groundStop && !faa.data.groundDelay && faa.data.delays.length === 0 ? (
            <p className="text-sm text-muted">The FAA reports no ground stops or delay programmes for {airport.iata} right now.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {faa.data.groundStop && (
                <li className="flex flex-col gap-1.5">
                  <SeverityPill severity="high">Ground stop</SeverityPill>
                  <p className="text-sm text-foreground">
                    Departures to {airport.iata} are being held{faa.data.groundStop.reason ? ` because of ${faa.data.groundStop.reason}` : ""}
                    {faa.data.groundStop.endTime ? `, until ${faa.data.groundStop.endTime}` : ""}.
                  </p>
                </li>
              )}
              {faa.data.groundDelay && (
                <li className="flex flex-col gap-1.5">
                  <SeverityPill severity={(faa.data.groundDelay.avgMinutes ?? 0) >= 60 ? "high" : "caution"}>Ground delay programme</SeverityPill>
                  <p className="text-sm text-foreground">
                    Flights to {airport.iata} are being held back at their origin
                    {faa.data.groundDelay.reason ? ` (${faa.data.groundDelay.reason})` : ""}: about{" "}
                    {faa.data.groundDelay.avgMinutes !== null ? formatDuration(faa.data.groundDelay.avgMinutes) : "an unknown time"} on average
                    {faa.data.groundDelay.maxMinutes ? `, up to ${formatDuration(faa.data.groundDelay.maxMinutes)}` : ""}.
                  </p>
                </li>
              )}
              {faa.data.delays.map((d) => (
                <li key={d.kind} className="flex flex-col gap-1.5">
                  <SeverityPill severity={(d.maxMinutes ?? 0) >= 60 ? "high" : (d.maxMinutes ?? 0) >= 20 ? "caution" : "none"}>{d.kind} delays</SeverityPill>
                  <p className="text-sm text-foreground">
                    {d.minMinutes !== null ? formatDuration(d.minMinutes) : "?"} to {d.maxMinutes !== null ? formatDuration(d.maxMinutes) : "?"}
                    {d.trend ? `, ${d.trend.toLowerCase()}` : ""}.
                  </p>
                </li>
              ))}
            </ul>
          )}

          {faa.data.notices.length > 0 && (
            <details className="text-xs text-muted">
              <summary className="cursor-pointer select-none py-1 hover:text-foreground">
                Airport notices (NOTAM), {faa.data.notices.length}
              </summary>
              <p className="mt-1 leading-relaxed">Many of these restrict general aviation only and don&apos;t affect airline flights, so they aren&apos;t counted in the outlook.</p>
              <ul className="mt-2 flex flex-col gap-2">
                {faa.data.notices.map((n, i) => (
                  <li key={i} className="break-words font-mono leading-relaxed">
                    {n.text}
                    {n.reopen ? ` (reopens ${n.reopen})` : ""}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {faa.data.updatedAt && <p className="text-xs text-muted">FAA status as of {faa.data.updatedAt}</p>}
        </div>
      )}
    </TripCard>
  );
}
