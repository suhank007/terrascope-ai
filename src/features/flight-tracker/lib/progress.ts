import { haversineKm } from "@/features/trip/lib/geo";
import type { Progress } from "../types";

interface Point {
  latitude: number;
  longitude: number;
}

const KT_TO_KMH = 1.852;
/** Below this ground speed an aircraft is taxiing or in the pattern, and an ETA from it would be nonsense. */
const MIN_CRUISE_KT = 120;
/** A great-circle track is the shortest path; real routings add some, but not this much. */
const OFF_ROUTE_FACTOR = 1.35;
const OFF_ROUTE_SLACK_KM = 150;

export function computeProgress(
  origin: Point,
  destination: Point,
  live: Point & { speedKt: number | null; onGround: boolean }
): Progress {
  const totalKm = haversineKm(origin.latitude, origin.longitude, destination.latitude, destination.longitude);
  const remainingKm = haversineKm(live.latitude, live.longitude, destination.latitude, destination.longitude);
  const flownKm = haversineKm(origin.latitude, origin.longitude, live.latitude, live.longitude);

  const offRoute = flownKm + remainingKm > totalKm * OFF_ROUTE_FACTOR + OFF_ROUTE_SLACK_KM;
  const meaningful = totalKm >= 50 && !offRoute;
  const airborneAtSpeed = !live.onGround && live.speedKt !== null && live.speedKt >= MIN_CRUISE_KT;

  return {
    totalKm: Math.round(totalKm),
    remainingKm: Math.round(remainingKm),
    percent: meaningful ? Math.max(0, Math.min(100, Math.round((1 - remainingKm / totalKm) * 100))) : null,
    etaMinutes: airborneAtSpeed && !offRoute ? Math.round((remainingKm / (live.speedKt! * KT_TO_KMH)) * 60) : null,
    offRoute,
  };
}
