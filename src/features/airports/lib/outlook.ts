import type { Severity } from "@/features/trip/types";
import type { FaaStatus, Metar, Outlook, OutlookReason, TafOutlook } from "../types";

const RANK: Record<Severity, number> = { none: 0, caution: 1, high: 2, critical: 3 };
const hasWord = (list: string[], word: string) => list.some((w) => w.includes(word));

export interface OutlookInput {
  metar: Metar | null;
  taf: TafOutlook | null;
  faa: FaaStatus | null;
  /**
   * "covered": a US airport and the feed answered. "outage": a US airport but
   * the feed didn't answer (never read as "all normal"). "not-covered": outside
   * the US, where no free public delay feed exists.
   */
  faaState: "covered" | "outage" | "not-covered";
}

/**
 * A transparent "how likely is disruption right now" read for one airport. US
 * airports get the FAA's own ground stops and delay programmes; everywhere else
 * there is no free public delay feed, so the outlook is weather-only and says so.
 * It never reaches "critical": nothing here is an official closure.
 */
export function computeOutlook({ metar, taf, faa, faaState }: OutlookInput): Outlook {
  const reasons: OutlookReason[] = [];

  if (faa) {
    if (faa.groundStop) {
      reasons.push({
        severity: "high",
        text: `FAA ground stop in effect${faa.groundStop.reason ? ` (${faa.groundStop.reason})` : ""}${faa.groundStop.endTime ? `, until ${faa.groundStop.endTime}` : ""}. Departures to this airport are being held.`,
        source: "FAA",
      });
    }
    if (faa.groundDelay) {
      const avg = faa.groundDelay.avgMinutes;
      reasons.push({
        severity: avg !== null && avg >= 60 ? "high" : "caution",
        text: `FAA ground delay programme${faa.groundDelay.reason ? ` (${faa.groundDelay.reason})` : ""}: average delay ${avg ?? "?"} min${faa.groundDelay.maxMinutes ? `, up to ${faa.groundDelay.maxMinutes} min` : ""}.`,
        source: "FAA",
      });
    }
    for (const d of faa.delays) {
      const worst = d.maxMinutes ?? d.minMinutes ?? 0;
      if (worst < 20) continue;
      reasons.push({
        severity: worst >= 60 ? "high" : "caution",
        text: `${d.kind} delays of ${d.minMinutes ?? "?"} to ${d.maxMinutes ?? "?"} min${d.trend ? `, ${d.trend.toLowerCase()}` : ""}${d.reason ? ` (${d.reason.replace(/^.*?:/, "").trim() || d.reason})` : ""}.`,
        source: "FAA",
      });
    }
  }

  if (metar) {
    const { flightCategory, weather, gustKt, windKt } = metar;
    if (flightCategory === "LIFR") {
      reasons.push({ severity: "high", text: "Very low visibility or cloud right now (LIFR). Expect delays and possible diversions.", source: "METAR" });
    } else if (flightCategory === "IFR") {
      reasons.push({ severity: "caution", text: "Low visibility or cloud right now (IFR). Arrival rates are usually reduced.", source: "METAR" });
    }
    if (hasWord(weather, "thunderstorm")) {
      reasons.push({ severity: "caution", text: "Thunderstorms at the airport right now.", source: "METAR" });
    }
    if (hasWord(weather, "volcanic ash")) {
      reasons.push({ severity: "high", text: "Volcanic ash reported at the airport.", source: "METAR" });
    }
    if (hasWord(weather, "snow") || hasWord(weather, "freezing") || hasWord(weather, "ice pellets")) {
      reasons.push({ severity: "caution", text: `Winter weather at the airport (${weather.filter((w) => /snow|freezing|ice/.test(w)).join(", ")}). De-icing can slow departures.`, source: "METAR" });
    }
    const gust = Math.max(gustKt ?? 0, windKt ?? 0);
    if (gust >= 40) reasons.push({ severity: "high", text: `Very strong wind, ${gust} kt.`, source: "METAR" });
    else if (gust >= 30) reasons.push({ severity: "caution", text: `Strong wind, ${gust} kt.`, source: "METAR" });
  }

  if (taf && (taf.worstCategory === "IFR" || taf.worstCategory === "LIFR")) {
    reasons.push({
      severity: "caution",
      text: `Poor conditions (${taf.worstCategory}) forecast in the next ${taf.hours} hours${taf.worstIsTemporary ? ", at times" : ""}.`,
      source: "TAF",
    });
  }
  if (taf?.thunderstorm && !(metar && hasWord(metar.weather, "thunderstorm"))) {
    reasons.push({ severity: "caution", text: `Thunderstorms forecast in the next ${taf.hours} hours.`, source: "TAF" });
  }

  reasons.sort((a, b) => RANK[b.severity] - RANK[a.severity]);
  const level = reasons.reduce<Severity>((worst, r) => (RANK[r.severity] > RANK[worst] ? r.severity : worst), "none");

  const unchecked: string[] = [];
  if (!metar) unchecked.push("Current weather");
  if (!taf) unchecked.push("Weather forecast");
  if (faaState === "outage") unchecked.push("FAA delay status");

  const headline =
    level === "high"
      ? "Disruption likely"
      : level === "caution"
        ? "Some disruption possible"
        : !metar
          ? "Couldn't check conditions"
          : faaState === "outage"
            ? "Couldn't confirm FAA status"
            : faaState === "covered"
              ? "Running normally"
              : "No weather problems";

  return { level, headline, reasons, basis: faaState === "covered" ? "faa-and-weather" : "weather-only", unchecked };
}
