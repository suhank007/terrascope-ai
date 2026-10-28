import { Activity, CloudSun, Flame, Plane, Wind, type LucideIcon } from "lucide-react";
import type { Layers } from "@/features/globe/context/globe-ui-context";

export interface LayerMeta {
  label: string;
  icon: LucideIcon;
  /** What one signal in this layer is called, for counts ("358 events"). */
  unit: [singular: string, plural: string];
  /** Short line under the Signal Explorer title. */
  blurb: string;
  source: string;
}

export const LAYER_META: Record<keyof Layers, LayerMeta> = {
  weather: {
    label: "Weather",
    icon: CloudSun,
    unit: ["city", "cities"],
    blurb: "Current conditions in 20 major cities",
    source: "Open-Meteo",
  },
  earthquakes: {
    label: "Earthquakes",
    icon: Activity,
    unit: ["event", "events"],
    blurb: "Magnitude 2.5 and above, past 24 hours",
    source: "USGS",
  },
  wildfires: {
    label: "Wildfires",
    icon: Flame,
    unit: ["event", "events"],
    blurb: "Satellite fire detections, past 24 hours",
    source: "NASA FIRMS",
  },
  flights: {
    label: "Flights",
    icon: Plane,
    unit: ["aircraft", "aircraft"],
    blurb: "Live aircraft inside the current view",
    source: "adsb.fi",
  },
  airQuality: {
    label: "Air quality",
    icon: Wind,
    unit: ["city", "cities"],
    blurb: "US AQI in 20 major cities",
    source: "Open-Meteo",
  },
};

/** Display order in the Data layers panel. */
export const LAYER_ORDER: (keyof Layers)[] = ["weather", "earthquakes", "wildfires", "flights", "airQuality"];

export function pluralize(count: number, unit: LayerMeta["unit"]): string {
  return `${count.toLocaleString()} ${count === 1 ? unit[0] : unit[1]}`;
}
