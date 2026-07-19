import type { Earthquake } from "@/features/earthquakes/types";
import type { Flight } from "@/features/flights/types";
import type { WildfireHotspot } from "@/features/wildfires/types";

export type SelectedEntity =
  | { type: "earthquake"; data: Earthquake }
  | { type: "flight"; data: Flight }
  | { type: "weather-point"; lat: number; lon: number; label?: string }
  | { type: "air-quality-point"; lat: number; lon: number; label?: string }
  | { type: "wildfire"; data: WildfireHotspot };
