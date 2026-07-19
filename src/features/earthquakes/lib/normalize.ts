import type { Earthquake } from "../types";

interface UsgsFeature {
  id: string;
  properties: {
    mag: number | null;
    place: string | null;
    time: number;
    url: string;
    tsunami: number;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number, number];
  };
}

interface UsgsFeatureCollection {
  metadata: { generated: number };
  features: UsgsFeature[];
}

export function normalizeEarthquakes(raw: UsgsFeatureCollection): { generatedAt: string; quakes: Earthquake[] } {
  const quakes: Earthquake[] = [];

  for (const feature of raw.features) {
    const { mag, place, time, url, tsunami } = feature.properties;
    if (mag === null) continue;
    const [longitude, latitude, depthKm] = feature.geometry.coordinates;

    quakes.push({
      id: feature.id,
      magnitude: mag,
      place: place ?? "Unknown location",
      time: new Date(time).toISOString(),
      longitude,
      latitude,
      depthKm,
      url,
      tsunami: tsunami === 1,
    });
  }

  return {
    generatedAt: new Date(raw.metadata.generated).toISOString(),
    quakes,
  };
}
