import { Droplets } from "lucide-react";
import { Facts, type FactItem } from "@/components/ui/facts";
import { weatherCodeInfo } from "@/features/weather/lib/weather-code";
import { formatMagnitude, formatRelativeTime, formatTemperature } from "@/lib/format";
import type { TripBrief } from "../types";
import { TripCard, Unavailable } from "./trip-card";

function weekday(date: string): string {
  // Dates arrive as local calendar days; pin to noon UTC so no zone can shift them.
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}

/** Seven days as plain columns: no boxes, so it reads as one strip instead of seven cards. */
export function ForecastStrip({ section }: { section: TripBrief["forecast"] }) {
  if (section.status !== "ok") return <Unavailable reason={section.reason} />;

  return (
    <ol className="grid grid-cols-7 text-center" aria-label="Seven day forecast">
      {section.data.days.map((day) => {
        const info = weatherCodeInfo(day.weatherCode);
        return (
          <li key={day.date} className="flex flex-col items-center gap-1.5 px-0.5">
            <span className="text-xs text-muted">{weekday(day.date)}</span>
            <info.icon className="h-5 w-5 text-foreground/80" aria-label={info.label} />
            <span className="font-mono text-sm text-foreground">{formatTemperature(day.maxC)}</span>
            <span className="font-mono text-xs text-muted">{formatTemperature(day.minC)}</span>
            <span className="flex h-4 items-center gap-0.5 text-xs text-muted">
              {day.rainChancePct !== null && day.rainChancePct >= 20 ? (
                <>
                  <Droplets className="h-3 w-3" aria-hidden />
                  {day.rainChancePct}%
                </>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function ConditionsCard({ brief, className }: { brief: TripBrief; className?: string }) {
  const { airQuality, hazards } = brief;

  const items: FactItem[] = [
    {
      label: "Air quality",
      value:
        airQuality.status === "ok" ? (
          <>
            <span className="font-medium" style={{ color: airQuality.data.color }}>
              {airQuality.data.label}
            </span>{" "}
            <span className="font-mono text-xs text-muted">AQI {Math.round(airQuality.data.usAqi)}</span>
          </>
        ) : (
          <span className="text-muted">Unavailable</span>
        ),
    },
  ];

  if (hazards.status === "ok") {
    const { quakes, quakeRadiusKm, fireRadiusKm, fireCount, nearestFireKm, firesChecked } = hazards.data;
    items.push(
      {
        label: `Earthquakes within ${quakeRadiusKm} km`,
        value: quakes.length === 0 ? <span className="text-muted">None in 24 hours</span> : `${quakes.length} in 24 hours`,
        note:
          quakes.length > 0
            ? quakes
                .slice(0, 3)
                .map((q) => `${formatMagnitude(q.magnitude)}, ${q.distanceKm} km, ${formatRelativeTime(q.time)}${q.tsunami ? ", tsunami advisory" : ""}`)
                .join(" · ")
            : undefined,
      },
      {
        label: `Fires within ${fireRadiusKm} km`,
        value: !firesChecked ? <span className="text-muted">Not available</span> : fireCount === 0 ? <span className="text-muted">None detected</span> : `${fireCount} detected`,
        note: firesChecked && fireCount > 0 ? `Nearest ${nearestFireKm} km away` : undefined,
      }
    );
  }

  return (
    <TripCard id="conditions" title="Conditions" className={className}>
      <div className="flex flex-col gap-6">
        <ForecastStrip section={brief.forecast} />
        {hazards.status === "unavailable" && <Unavailable reason={hazards.reason} />}
        <Facts items={items} />
      </div>
    </TripCard>
  );
}
