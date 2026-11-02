import type { FlightCategory } from "../types";

/** 🇬🇧 from "GB": two regional-indicator letters. Returns "" for anything that isn't a 2-letter code. */
export function flagEmoji(countryCode: string): string {
  const code = countryCode.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export const CATEGORY_INFO: Record<FlightCategory, { label: string; meaning: string; tone: "none" | "caution" | "high" }> = {
  VFR: { label: "VFR", meaning: "Clear: good visibility and high cloud.", tone: "none" },
  MVFR: { label: "MVFR", meaning: "Marginal: reduced visibility or lower cloud.", tone: "none" },
  IFR: { label: "IFR", meaning: "Poor: pilots must fly by instruments, so arrival rates usually drop.", tone: "caution" },
  LIFR: { label: "LIFR", meaning: "Very poor: fog or very low cloud, with delays and diversions likely.", tone: "high" },
};

/** "230° at 12 kt, gusting 24" */
export function describeWind(dir: number | "VRB" | null, speedKt: number | null, gustKt: number | null): string {
  if (speedKt === null) return "—";
  if (speedKt === 0) return "Calm";
  const from = dir === "VRB" ? "Variable" : dir === null ? "" : `${String(dir).padStart(3, "0")}°`;
  return `${from ? `${from} at ` : ""}${speedKt} kt${gustKt ? `, gusting ${gustKt}` : ""}`;
}

export function describeVisibility(sm: number | null): string {
  if (sm === null) return "—";
  return sm >= 6 ? "6+ mi" : `${sm.toFixed(sm < 1 ? 2 : 1).replace(/\.0$/, "")} mi`;
}

export function describeCeiling(ft: number | null): string {
  return ft === null ? "No low cloud" : `${ft.toLocaleString()} ft`;
}

/** "12 min", "1 h 05 min" */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")} min`;
}

/**
 * A TAF repeats the same weather across groups ("nearby thunderstorm", "light
 * thunderstorm with rain", "thunderstorm with rain"). Strip the intensity words,
 * drop anything already covered by a longer phrase, and keep the first few.
 */
export function summarizeWeather(weather: string[], max = 3): string[] {
  const bases = [...new Set(weather.map((w) => w.replace(/^(?:nearby|light|heavy) /, "")))];
  return bases.filter((b) => !bases.some((other) => other !== b && other.includes(b))).slice(0, max);
}
