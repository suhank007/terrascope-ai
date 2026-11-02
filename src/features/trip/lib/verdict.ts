import { formatMagnitude } from "@/lib/format";
import type {
  AdvisoriesData,
  AirQualityData,
  ForecastData,
  HazardsData,
  HealthData,
  Section,
  Severity,
  Verdict,
  VerdictReason,
} from "../types";

const RANK: Record<Severity, number> = { none: 0, caution: 1, high: 2, critical: 3 };

export function maxSeverity(levels: Severity[]): Severity {
  return levels.reduce<Severity>((worst, level) => (RANK[level] > RANK[worst] ? level : worst), "none");
}

export interface VerdictInput {
  advisories: Section<AdvisoriesData>;
  health: Section<HealthData>;
  hazards: Section<HazardsData>;
  airQuality: Section<AirQualityData>;
  forecast: Section<ForecastData>;
  /** Injected so tests (and cached responses) are deterministic. */
  now?: number;
}

const HEADLINES: Record<Severity, string> = {
  none: "No major flags right now",
  caution: "Fine to go, with some care",
  high: "Reconsider, or prepare carefully",
  critical: "Official advice: do not travel",
};

function hoursAgo(iso: string, now: number): string {
  const hours = Math.max(0, Math.round((now - Date.parse(iso)) / 3_600_000));
  return hours < 1 ? "just now" : hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

/**
 * One transparent call built only from public signals. It is a summary of what
 * other people's feeds say, so every reason names its source, and "critical"
 * is reserved for an official government or health-agency "do not travel".
 * Natural hazards and weather top out at "high", and only for a M7+ quake or
 * hazardous air; everything else they flag is "caution".
 */
export function computeVerdict({ advisories, health, hazards, airQuality, forecast, now = Date.now() }: VerdictInput): Verdict {
  const reasons: VerdictReason[] = [];

  if (advisories.status === "ok") {
    const { uk, us } = advisories.data;
    if (uk && uk.severity !== "none") {
      reasons.push({
        severity: uk.severity,
        text: uk.partial
          ? "The UK FCDO advises against travel to parts of the country."
          : uk.severity === "critical"
            ? "The UK FCDO advises against all travel to this country."
            : "The UK FCDO advises against all but essential travel to this country.",
        source: "UK FCDO",
        url: uk.url,
      });
    }
    if (us && us.severity !== "none") {
      reasons.push({
        severity: us.severity,
        text: `US State Department: Level ${us.level}, ${us.label}.`,
        source: "US State Dept",
        url: us.url,
      });
    }
  }

  if (health.status === "ok") {
    for (const notice of health.data.notices.filter((n) => n.severity !== "none").slice(0, 3)) {
      reasons.push({ severity: notice.severity, text: `CDC Level ${notice.level}: ${notice.title}.`, source: "CDC", url: notice.url });
    }
    for (const outbreak of health.data.outbreaks.slice(0, 2)) {
      reasons.push({
        severity: "caution",
        text: `WHO outbreak report: ${outbreak.title}.`,
        source: "WHO",
        url: outbreak.url,
      });
    }
  }

  if (hazards.status === "ok") {
    const { quakes, fireCount, nearestFireKm, quakeRadiusKm, fireRadiusKm } = hazards.data;
    const recent = quakes.filter((q) => now - Date.parse(q.time) <= 86_400_000);
    for (const q of recent.filter((x) => x.magnitude >= 6).slice(0, 2)) {
      reasons.push({
        severity: q.magnitude >= 7 ? "high" : "caution",
        text: `${formatMagnitude(q.magnitude)} earthquake ${q.distanceKm} km away, ${hoursAgo(q.time, now)}${q.tsunami ? ", tsunami advisory" : ""}.`,
        source: "USGS",
      });
    }
    if (!recent.some((q) => q.magnitude >= 6) && recent.some((q) => q.tsunami)) {
      reasons.push({ severity: "caution", text: `A tsunami advisory is active for an earthquake within ${quakeRadiusKm} km.`, source: "USGS" });
    }
    if (fireCount > 0 && nearestFireKm !== null && (nearestFireKm <= 50 || fireCount >= 10)) {
      reasons.push({
        severity: "caution",
        text: `${fireCount} satellite fire detection${fireCount === 1 ? "" : "s"} within ${fireRadiusKm} km, nearest ${nearestFireKm} km away.`,
        source: "NASA FIRMS",
      });
    }
  }

  if (airQuality.status === "ok" && airQuality.data.usAqi >= 151) {
    reasons.push({
      severity: airQuality.data.usAqi >= 201 ? "high" : "caution",
      text: `Air quality is ${airQuality.data.label.toLowerCase()} (US AQI ${Math.round(airQuality.data.usAqi)}).`,
      source: "Open-Meteo",
    });
  }

  if (forecast.status === "ok") {
    const soon = forecast.data.days.slice(0, 3);
    if (soon.some((d) => d.weatherCode >= 95)) {
      reasons.push({ severity: "caution", text: "Thunderstorms are forecast in the next three days.", source: "Open-Meteo" });
    }
    const hottest = Math.max(...soon.map((d) => d.maxC));
    if (hottest >= 40) reasons.push({ severity: "caution", text: `Extreme heat is forecast, up to ${Math.round(hottest)}°C.`, source: "Open-Meteo" });
    const coldest = Math.min(...soon.map((d) => d.minC));
    if (coldest <= -20) reasons.push({ severity: "caution", text: `Extreme cold is forecast, down to ${Math.round(coldest)}°C.`, source: "Open-Meteo" });
    if (soon.some((d) => (d.windMaxKph ?? 0) >= 70)) {
      reasons.push({ severity: "caution", text: "Very strong winds are forecast in the next three days.", source: "Open-Meteo" });
    }
  }

  reasons.sort((a, b) => RANK[b.severity] - RANK[a.severity]);
  const level = maxSeverity(reasons.map((r) => r.severity));

  const unchecked = (
    [
      ["Government advisories", advisories],
      ["Health notices", health],
      ["Live hazards", hazards],
      ["Air quality", airQuality],
      ["Forecast", forecast],
    ] as const
  )
    .filter(([, section]) => section.status === "unavailable")
    .map(([label]) => label);

  // A quiet result from a check that didn't run is not "no flags".
  const headline =
    level === "none" && (advisories.status === "unavailable" || health.status === "unavailable")
      ? "Couldn't confirm official advice"
      : HEADLINES[level];

  return { level, headline, reasons, unchecked };
}
