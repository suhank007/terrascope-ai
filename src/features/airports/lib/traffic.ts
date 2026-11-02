import type { Flight } from "@/features/flights/types";
import type { AirportTraffic, TrafficPhase, TrafficSample } from "../types";

const M_TO_FT = 3.28084;
const MS_TO_KT = 1.94384;
const MS_TO_FPM = 196.85;
/** Below this the aircraft is in the terminal area, where a clear climb or descent means a departure or arrival. */
const TERMINAL_CEILING_FT = 12_000;
const CLIMB_DESCENT_FPM = 300;
/** adsb.fi truncates very busy queries; beyond this many we say the counts are a floor. */
const CAP = 250;

export function classifyPhase(f: Flight): TrafficPhase {
  if (f.onGround) return "ground";
  const altFt = f.altitudeM !== null ? f.altitudeM * M_TO_FT : null;
  const rate = f.verticalRateMs !== null ? f.verticalRateMs * MS_TO_FPM : null;
  if (altFt === null || rate === null || altFt > TERMINAL_CEILING_FT) return "other";
  if (rate <= -CLIMB_DESCENT_FPM) return "arriving";
  if (rate >= CLIMB_DESCENT_FPM) return "departing";
  return "other";
}

/** Turns the aircraft around an airport into counts and a short, most-relevant list. */
export function summarizeTraffic(flights: Flight[], radiusNm: number): AirportTraffic {
  const counts: Record<TrafficPhase, number> = { ground: 0, arriving: 0, departing: 0, other: 0 };
  const samples: (TrafficSample & { sortKey: number })[] = [];

  for (const f of flights) {
    const phase = classifyPhase(f);
    counts[phase]++;
    // Only arrivals and departures are worth listing; ground clutter and overflights are noise.
    if ((phase === "arriving" || phase === "departing") && f.callsign) {
      samples.push({
        callsign: f.callsign,
        aircraft: f.aircraftType,
        phase,
        // Pressure altitude can read a little below zero near sea level; nobody flies at -200 ft.
        altitudeFt: f.altitudeM !== null ? Math.max(0, Math.round(f.altitudeM * M_TO_FT)) : null,
        speedKt: f.velocityMs !== null ? Math.round(f.velocityMs * MS_TO_KT) : null,
        sortKey: f.altitudeM ?? Infinity,
      });
    }
  }

  samples.sort((a, b) => a.sortKey - b.sortKey);
  return {
    radiusNm,
    total: flights.length,
    onGround: counts.ground,
    arriving: counts.arriving,
    departing: counts.departing,
    other: counts.other,
    samples: samples.slice(0, 8).map((s) => ({ callsign: s.callsign, aircraft: s.aircraft, phase: s.phase, altitudeFt: s.altitudeFt, speedKt: s.speedKt })),
    capped: flights.length >= CAP,
  };
}
