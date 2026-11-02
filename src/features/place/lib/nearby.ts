import { haversineKm } from "@/features/trip/lib/geo";
import type { Earthquake } from "@/features/earthquakes/types";
import type { WildfireHotspot } from "@/features/wildfires/types";
import type { PlaceFires, PlaceQuakes } from "../types";

type Point = { latitude: number; longitude: number };

const MAX_LISTED = 10;

export function nearbyQuakes(center: Point, quakes: Earthquake[], radiusKm: number): PlaceQuakes {
  const within = quakes
    .map((q) => ({ ...q, distanceKm: Math.round(haversineKm(center.latitude, center.longitude, q.latitude, q.longitude)) }))
    .filter((q) => q.distanceKm <= radiusKm)
    .sort((a, b) => b.magnitude - a.magnitude || a.distanceKm - b.distanceKm);

  return {
    radiusKm,
    total: within.length,
    strongest: within[0]?.magnitude ?? null,
    quakes: within.slice(0, MAX_LISTED),
  };
}

export function nearbyFires(center: Point, hotspots: WildfireHotspot[], radiusKm: number): PlaceFires {
  const within = hotspots
    .map((f) => ({ ...f, distanceKm: Math.round(haversineKm(center.latitude, center.longitude, f.latitude, f.longitude)) }))
    .filter((f) => f.distanceKm <= radiusKm);

  const byIntensity = [...within].sort((a, b) => b.frp - a.frp);
  return {
    radiusKm,
    total: within.length,
    nearestKm: within.length ? Math.min(...within.map((f) => f.distanceKm)) : null,
    strongestFrp: byIntensity[0]?.frp ?? null,
    fires: byIntensity.slice(0, MAX_LISTED),
  };
}
