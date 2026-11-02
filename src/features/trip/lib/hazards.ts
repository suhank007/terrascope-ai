import { haversineKm } from "./geo";
import type { HazardsData } from "../types";
import type { Earthquake } from "@/features/earthquakes/types";
import type { WildfireHotspot } from "@/features/wildfires/types";

export const QUAKE_RADIUS_KM = 300;
export const FIRE_RADIUS_KM = 100;

/** What the live feeds say is happening around a point right now. `fires` is
 *  null when the wildfire feed isn't configured, so we never claim "no fires". */
export function computeHazards(
  center: { latitude: number; longitude: number },
  quakes: Earthquake[],
  fires: WildfireHotspot[] | null
): HazardsData {
  const nearbyQuakes = quakes
    .map((q) => ({
      id: q.id,
      magnitude: q.magnitude,
      place: q.place,
      time: q.time,
      tsunami: q.tsunami,
      distanceKm: Math.round(haversineKm(center.latitude, center.longitude, q.latitude, q.longitude)),
    }))
    .filter((q) => q.distanceKm <= QUAKE_RADIUS_KM)
    .sort((a, b) => b.magnitude - a.magnitude || a.distanceKm - b.distanceKm)
    .slice(0, 5);

  const fireDistances = (fires ?? [])
    .map((f) => haversineKm(center.latitude, center.longitude, f.latitude, f.longitude))
    .filter((d) => d <= FIRE_RADIUS_KM);

  return {
    quakes: nearbyQuakes,
    fireCount: fireDistances.length,
    nearestFireKm: fireDistances.length ? Math.round(Math.min(...fireDistances)) : null,
    firesChecked: fires !== null,
    quakeRadiusKm: QUAKE_RADIUS_KM,
    fireRadiusKm: FIRE_RADIUS_KM,
  };
}
