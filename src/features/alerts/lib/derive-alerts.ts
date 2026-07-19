import type { Earthquake } from "@/features/earthquakes/types";
import type { WildfireHotspot } from "@/features/wildfires/types";
import type { AlertItem } from "../types";

// Scoped deliberately to signals that are already fetched as complete global
// feeds (not per-city), so alerts stay correct regardless of which layers the
// user currently has toggled on, without fanning out extra per-point queries.
const EARTHQUAKE_WATCH_MAGNITUDE = 5.5;
const EARTHQUAKE_WARNING_MAGNITUDE = 7;
const WILDFIRE_WATCH_FRP = 50;
const WILDFIRE_WARNING_FRP = 200;
const MAX_ALERTS = 20;

export function deriveAlerts(
  quakes: Earthquake[] | undefined,
  wildfires: WildfireHotspot[] | undefined
): AlertItem[] {
  const alerts: AlertItem[] = [];

  for (const quake of quakes ?? []) {
    if (quake.magnitude < EARTHQUAKE_WATCH_MAGNITUDE) continue;
    alerts.push({
      id: `alert-eq-${quake.id}`,
      kind: "earthquake",
      severity: quake.magnitude >= EARTHQUAKE_WARNING_MAGNITUDE ? "warning" : "watch",
      data: quake,
    });
  }

  for (const fire of wildfires ?? []) {
    if (fire.confidence !== "high" || fire.frp < WILDFIRE_WATCH_FRP) continue;
    alerts.push({
      id: `alert-fire-${fire.id}`,
      kind: "wildfire",
      severity: fire.frp >= WILDFIRE_WARNING_FRP ? "warning" : "watch",
      data: fire,
    });
  }

  alerts.sort((a, b) => {
    const timeA = a.kind === "earthquake" ? a.data.time : a.data.acquiredAt;
    const timeB = b.kind === "earthquake" ? b.data.time : b.data.acquiredAt;
    return new Date(timeB).getTime() - new Date(timeA).getTime();
  });

  return alerts.slice(0, MAX_ALERTS);
}
