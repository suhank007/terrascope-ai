import "server-only";
import { normalizeEarthquakes } from "./normalize";
import type { EarthquakesResponse } from "../types";

const USGS_FEED_URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";

export async function fetchEarthquakesData(): Promise<EarthquakesResponse> {
  const res = await fetch(USGS_FEED_URL, { next: { revalidate: 60 } });

  if (!res.ok) {
    return { generatedAt: new Date().toISOString(), count: 0, quakes: [] };
  }

  const raw = await res.json();
  const { generatedAt, quakes } = normalizeEarthquakes(raw);

  return { generatedAt, count: quakes.length, quakes };
}
