import { CloudSun, Droplets, Flame, Wind } from "lucide-react";
import { weatherCodeInfo } from "@/features/weather/lib/weather-code";
import { formatMagnitude, formatRelativeTime, formatTemperature } from "@/lib/format";
import type { TripBrief } from "../types";
import { TripCard, Unavailable } from "./trip-card";

function weekday(date: string): string {
  // Dates arrive as local calendar days; pin to noon UTC so no zone can shift them.
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}

export function ForecastStrip({ section }: { section: TripBrief["forecast"] }) {
  if (section.status !== "ok") return <Unavailable reason={section.reason} />;
  const { days } = section.data;

  return (
    <ol className="grid grid-cols-7 gap-1.5" aria-label="Seven day forecast">
      {days.map((day) => {
        const info = weatherCodeInfo(day.weatherCode);
        return (
          <li key={day.date} className="flex flex-col items-center gap-1 rounded-lg border border-border bg-background/40 px-1 py-2 text-center">
            <span className="text-[11px] text-muted">{weekday(day.date)}</span>
            <info.icon className="h-4 w-4 text-accent" aria-label={info.label} />
            <span className="font-mono text-xs font-medium text-foreground">{formatTemperature(day.maxC)}</span>
            <span className="font-mono text-[11px] text-muted">{formatTemperature(day.minC)}</span>
            {day.rainChancePct !== null && day.rainChancePct >= 20 && (
              <span className="flex items-center gap-0.5 text-[10px] text-muted">
                <Droplets className="h-2.5 w-2.5" aria-hidden />
                {day.rainChancePct}%
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function ConditionsCard({ brief, className }: { brief: TripBrief; className?: string }) {
  const { airQuality, hazards } = brief;

  return (
    <TripCard id="conditions" icon={CloudSun} title="Conditions on the ground" className={className}>
      <div className="flex flex-col gap-5">
        <ForecastStrip section={brief.forecast} />

        <ul className="flex flex-col gap-3 text-sm">
          <li className="flex items-start gap-3">
            <Wind className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
            {airQuality.status === "ok" ? (
              <span className="text-foreground">
                Air quality is{" "}
                <span className="font-medium" style={{ color: airQuality.data.color }}>
                  {airQuality.data.label.toLowerCase()}
                </span>{" "}
                <span className="font-mono text-xs text-muted">(US AQI {Math.round(airQuality.data.usAqi)})</span>
              </span>
            ) : (
              <span className="text-muted">{airQuality.reason}</span>
            )}
          </li>

          {hazards.status === "ok" ? (
            <>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-muted" aria-hidden>
                  ≈
                </span>
                <div className="text-foreground">
                  {hazards.data.quakes.length === 0 ? (
                    <span className="text-muted">No earthquakes of M2.5+ within {hazards.data.quakeRadiusKm} km in the past 24 hours.</span>
                  ) : (
                    <>
                      <span>
                        {hazards.data.quakes.length} earthquake{hazards.data.quakes.length === 1 ? "" : "s"} within {hazards.data.quakeRadiusKm} km in the past 24 hours:
                      </span>
                      <ul className="mt-1.5 flex flex-col gap-1">
                        {hazards.data.quakes.map((q) => (
                          <li key={q.id} className="text-xs text-muted">
                            <span className="font-mono text-foreground">{formatMagnitude(q.magnitude)}</span> · {q.distanceKm} km away · {formatRelativeTime(q.time)}
                            {q.tsunami && <span className="text-alert"> · tsunami advisory</span>}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Flame className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                <span className={hazards.data.fireCount > 0 ? "text-foreground" : "text-muted"}>
                  {!hazards.data.firesChecked
                    ? "Wildfire detections aren't available right now."
                    : hazards.data.fireCount === 0
                      ? `No satellite fire detections within ${hazards.data.fireRadiusKm} km.`
                      : `${hazards.data.fireCount} satellite fire detection${hazards.data.fireCount === 1 ? "" : "s"} within ${hazards.data.fireRadiusKm} km, nearest ${hazards.data.nearestFireKm} km.`}
                </span>
              </li>
            </>
          ) : (
            <li className="text-muted">{hazards.reason}</li>
          )}
        </ul>
      </div>
    </TripCard>
  );
}
