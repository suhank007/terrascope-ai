"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, CloudSun, Flame, Loader2, MapPinned, Wind, X, type LucideIcon } from "lucide-react";
import { Facts } from "@/components/ui/facts";
import { useGlobeUi, type Layers } from "@/features/globe/context/globe-ui-context";
import { colorForMagnitude } from "@/features/earthquakes/lib/color-scale";
import { colorForConfidence } from "@/features/wildfires/lib/color-scale";
import { ForecastStrip } from "@/features/trip/components/conditions-card";
import { Unavailable } from "@/features/trip/components/trip-card";
import { Switch } from "@/features/workspace/components/switch";
import { useCameraActions } from "@/features/workspace/hooks/use-fly-to";
import { weatherCodeInfo } from "@/features/weather/lib/weather-code";
import { formatCoordinate, formatMagnitude, formatRelativeTime, formatTemperature, formatWindKph } from "@/lib/format";
import { cn } from "@/lib/utils";
import { usePlaceReport } from "../hooks/use-place-report";
import { aqiAdvice, compassPoint, fireIntensity, quakeFeel } from "../lib/advice";
import type { PlaceReport as Report, SearchedPlace } from "../types";

type TabKey = "weather" | "airQuality" | "earthquakes" | "wildfires";

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: "weather", label: "Weather", icon: CloudSun },
  { key: "airQuality", label: "Air quality", icon: Wind },
  { key: "earthquakes", label: "Earthquakes", icon: Activity },
  { key: "wildfires", label: "Wildfires", icon: Flame },
];

/** The one-glance value shown on each tab, so all four answers are visible before anyone clicks. */
function summary(key: TabKey, report: Report | undefined): { text: string; tone?: string } {
  if (!report) return { text: "…" };
  switch (key) {
    case "weather":
      return report.weather.status === "ok" ? { text: formatTemperature(report.weather.data.temperatureC) } : { text: "n/a" };
    case "airQuality":
      return report.airQuality.status === "ok"
        ? { text: `AQI ${Math.round(report.airQuality.data.usAqi)}`, tone: report.airQuality.data.color }
        : { text: "n/a" };
    case "earthquakes":
      return report.earthquakes.status === "ok"
        ? { text: report.earthquakes.data.total === 0 ? "None" : String(report.earthquakes.data.total) }
        : { text: "n/a" };
    case "wildfires":
      return report.wildfires.status === "ok"
        ? { text: report.wildfires.data.total === 0 ? "None" : String(report.wildfires.data.total) }
        : { text: "Not checked" };
  }
}

const SOURCE: Record<TabKey, string> = {
  weather: "Open-Meteo",
  airQuality: "Open-Meteo CAMS",
  earthquakes: "USGS",
  wildfires: "NASA FIRMS",
};

function Row({ children, onClick, label }: { children: React.ReactNode; onClick?: () => void; label?: string }) {
  const className = "flex w-full items-start justify-between gap-4 border-b border-border/60 py-3 text-left";
  return (
    <li>
      {onClick ? (
        <button type="button" onClick={onClick} aria-label={label} className={cn(className, "transition-colors hover:bg-surface-elevated/60 focus-visible:bg-surface-elevated/60")}>
          {children}
        </button>
      ) : (
        <div className={className}>{children}</div>
      )}
    </li>
  );
}

function WeatherTab({ report }: { report: Report }) {
  const { weather } = report;
  if (weather.status !== "ok") return <Unavailable reason={weather.reason} />;
  const w = weather.data;
  const info = weatherCodeInfo(w.weatherCode);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <info.icon className="h-10 w-10 text-foreground/80" aria-hidden />
        <div>
          <p className="font-mono text-4xl font-semibold tracking-tight text-foreground">{formatTemperature(w.temperatureC)}</p>
          <p className="text-sm text-muted">
            {info.label}, feels like {formatTemperature(w.apparentC)}
          </p>
        </div>
      </div>
      <Facts
        items={[
          { label: "Humidity", value: `${Math.round(w.humidityPct)}%` },
          { label: "Wind", value: `${formatWindKph(w.windKph)} from the ${compassPoint(w.windDirectionDeg)}` },
          { label: "Rain now", value: w.precipitationMm > 0 ? `${w.precipitationMm.toFixed(1)} mm` : <span className="text-muted">None</span> },
        ]}
      />
      <div>
        <h3 className="mb-3 text-sm font-medium text-foreground">Next 7 days</h3>
        <ForecastStrip section={{ status: "ok", data: { timezone: w.timezone, days: w.days } }} />
      </div>
    </div>
  );
}

function AirQualityTab({ report }: { report: Report }) {
  const { airQuality } = report;
  if (airQuality.status !== "ok") return <Unavailable reason={airQuality.reason} />;
  const a = airQuality.data;
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="flex items-baseline gap-3">
          <span className="font-mono text-4xl font-semibold tracking-tight" style={{ color: a.color }}>
            {Math.round(a.usAqi)}
          </span>
          <span className="text-base font-medium" style={{ color: a.color }}>
            {a.label}
          </span>
        </p>
        <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-muted">{aqiAdvice(a.usAqi)}</p>
      </div>
      <Facts
        items={a.pollutants.map((p) => ({
          label: p.label,
          value: (
            <>
              <span className="font-mono">{p.value.toFixed(p.value >= 100 ? 0 : 1)}</span> <span className="text-xs text-muted">{p.unit}</span>
            </>
          ),
        }))}
      />
      <p className="text-xs text-muted">US AQI from the Open-Meteo CAMS model, a modelled estimate rather than a street-level sensor.</p>
    </div>
  );
}

function EarthquakesTab({ report, place }: { report: Report; place: SearchedPlace }) {
  const { setSelectedEntity } = useGlobeUi();
  const { flyTo } = useCameraActions();
  const { earthquakes } = report;
  if (earthquakes.status !== "ok") return <Unavailable reason={earthquakes.reason} />;
  const q = earthquakes.data;

  if (q.total === 0) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-foreground">No magnitude 2.5+ earthquakes within {q.radiusKm} km of {place.name} in the past 24 hours.</p>
        <p className="text-xs text-muted">Smaller tremors are not in this feed, so this means no notable activity, not none at all.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        <span className="font-medium text-foreground">{q.total}</span> in the past 24 hours within {q.radiusKm} km. Strongest{" "}
        <span className="font-mono text-foreground">{formatMagnitude(q.strongest ?? 0)}</span>, {quakeFeel(q.strongest ?? 0).toLowerCase()}.
      </p>
      <ul>
        {q.quakes.map((quake) => (
          <Row
            key={quake.id}
            label={`Show ${formatMagnitude(quake.magnitude)} earthquake, ${quake.place}`}
            onClick={() => {
              setSelectedEntity({ type: "earthquake", data: quake });
              flyTo(quake.longitude, quake.latitude, 1_200_000);
            }}
          >
            <span className="flex min-w-0 items-start gap-3">
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colorForMagnitude(quake.magnitude).toCssColorString() }} aria-hidden />
              <span className="min-w-0">
                <span className="block truncate text-sm text-foreground">{quake.place}</span>
                <span className="block text-xs text-muted">
                  {quake.distanceKm} km away · {Math.round(quake.depthKm)} km deep · {formatRelativeTime(quake.time)}
                  {quake.tsunami ? " · tsunami advisory" : ""}
                </span>
              </span>
            </span>
            <span className="shrink-0 font-mono text-sm font-medium text-foreground">{formatMagnitude(quake.magnitude)}</span>
          </Row>
        ))}
      </ul>
      {q.total > q.quakes.length && <p className="text-xs text-muted">Showing the {q.quakes.length} strongest of {q.total}.</p>}
    </div>
  );
}

function WildfiresTab({ report, place }: { report: Report; place: SearchedPlace }) {
  const { setSelectedEntity } = useGlobeUi();
  const { flyTo } = useCameraActions();
  const { wildfires } = report;
  if (wildfires.status !== "ok") return <Unavailable reason={wildfires.reason} />;
  const f = wildfires.data;

  if (f.total === 0) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-foreground">No satellite fire detections within {f.radiusKm} km of {place.name} in the past 24 hours.</p>
        <p className="text-xs text-muted">Satellites pass a few times a day and cloud can hide a fire, so check local news if you are worried.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        <span className="font-medium text-foreground">{f.total}</span> detections within {f.radiusKm} km. Nearest{" "}
        <span className="font-mono text-foreground">{f.nearestKm} km</span> away.
      </p>
      <ul>
        {f.fires.map((fire) => (
          <Row
            key={fire.id}
            label={`Show fire detection ${fire.distanceKm} km away`}
            onClick={() => {
              setSelectedEntity({ type: "wildfire", data: fire });
              flyTo(fire.longitude, fire.latitude, 600_000);
            }}
          >
            <span className="flex min-w-0 items-start gap-3">
              <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: colorForConfidence(fire.confidence).toCssColorString() }} aria-hidden />
              <span className="min-w-0">
                <span className="block text-sm text-foreground">
                  {fireIntensity(fire.frp)} fire, {Math.round(fire.frp)} MW
                </span>
                <span className="block text-xs text-muted">
                  {formatCoordinate(fire.latitude, "lat")}, {formatCoordinate(fire.longitude, "lon")} · {formatRelativeTime(fire.acquiredAt)} · {fire.confidence} confidence
                </span>
              </span>
            </span>
            <span className="shrink-0 font-mono text-sm text-foreground">{fire.distanceKm} km</span>
          </Row>
        ))}
      </ul>
      {f.total > f.fires.length && <p className="text-xs text-muted">Showing the {f.fires.length} most intense of {f.total}.</p>}
    </div>
  );
}

/** What a search leaves behind: the four things people ask about a place, one tab each. */
export function PlaceReport({ place }: { place: SearchedPlace }) {
  const { setSearchedPlace, layers, toggleLayer, setFocusedLayer } = useGlobeUi();
  const { data, isLoading, isError, refetch } = usePlaceReport(place);
  const [tab, setTab] = useState<TabKey>("weather");
  const layerKey = tab as keyof Layers;
  const tripHref = place.countryCode
    ? `/trip?${new URLSearchParams({ name: place.name, cc: place.countryCode, lat: place.latitude.toFixed(3), lon: place.longitude.toFixed(3) })}`
    : null;

  const pick = (key: TabKey) => {
    setTab(key);
    setFocusedLayer(key);
  };

  return (
    <section aria-label={`Conditions in ${place.name}`} className="flex h-full min-h-0 flex-col overflow-y-auto xl:overflow-hidden">
      <header className="shrink-0 px-5 pb-3 pt-3 xl:pt-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-baseline gap-2.5">
            <h2 className="truncate text-xl font-semibold tracking-tight text-foreground">{place.name}</h2>
            <span className="shrink-0 text-xs text-muted">{place.scope === "region" ? "Country or region" : "City"}</span>
          </div>
          <button
            type="button"
            onClick={() => setSearchedPlace(null)}
            aria-label="Close place report"
            title="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-4">
          <p className="truncate text-xs text-muted">{place.displayName}</p>
          {tripHref && (
            <Link href={tripHref} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-accent hover:underline">
              <MapPinned className="h-3.5 w-3.5" aria-hidden />
              Trip brief
            </Link>
          )}
        </div>
      </header>

      <div role="tablist" aria-label="Conditions" className="sticky top-0 z-10 grid shrink-0 grid-cols-4 gap-1 border-y border-border bg-surface px-3 py-2 xl:static">
        {TABS.map(({ key, label, icon: Icon }) => {
          const s = summary(key, data);
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => pick(key)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-center transition-colors",
                active ? "bg-accent-soft text-accent" : "text-foreground/80 hover:bg-surface-elevated"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span className="text-xs font-medium">{label}</span>
              <span className="font-mono text-xs tabular-nums" style={!active && s.tone ? { color: s.tone } : undefined}>
                {isLoading ? <Loader2 className="inline h-3 w-3 animate-spin" aria-label="Loading" /> : s.text}
              </span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" aria-label={TABS.find((t) => t.key === tab)?.label} className="shrink-0 px-5 py-5 xl:min-h-0 xl:flex-1 xl:shrink xl:overflow-y-auto">
        {isError ? (
          <div className="flex flex-col items-start gap-3">
            <Unavailable reason="We couldn't load conditions for this place." />
            <button type="button" onClick={() => refetch()} className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground hover:border-accent/50 hover:text-accent">
              Try again
            </button>
          </div>
        ) : isLoading || !data ? (
          <div aria-busy="true" className="flex flex-col gap-3">
            <div className="h-10 w-40 animate-pulse rounded bg-surface-elevated" />
            <div className="h-24 animate-pulse rounded bg-surface-elevated" />
          </div>
        ) : tab === "weather" ? (
          <WeatherTab report={data} />
        ) : tab === "airQuality" ? (
          <AirQualityTab report={data} />
        ) : tab === "earthquakes" ? (
          <EarthquakesTab report={data} place={place} />
        ) : (
          <WildfiresTab report={data} place={place} />
        )}

        {place.scope === "region" && (
          <p className="mt-6 text-xs text-muted">
            Weather and air quality are read at the centre of {place.name}. Earthquakes and fires cover {place.quakeRadiusKm} km around it.
          </p>
        )}
      </div>

      <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-border px-5 py-3 text-xs text-muted">
        <span className="flex items-center gap-2">
          Show on globe
          <Switch checked={layers[layerKey]} onCheckedChange={() => toggleLayer(layerKey)} label={`Show ${TABS.find((t) => t.key === tab)?.label} on globe`} />
        </span>
        <span>{SOURCE[tab]}</span>
      </footer>
    </section>
  );
}
