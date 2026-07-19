import type { Earthquake } from "@/features/earthquakes/types";
import type { WildfireHotspot } from "@/features/wildfires/types";

export type AlertSeverity = "watch" | "warning";

export type AlertItem =
  | { id: string; kind: "earthquake"; severity: AlertSeverity; data: Earthquake }
  | { id: string; kind: "wildfire"; severity: AlertSeverity; data: WildfireHotspot };
