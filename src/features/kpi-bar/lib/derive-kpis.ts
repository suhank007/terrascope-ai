import type { Earthquake } from "@/features/earthquakes/types";

export interface GlobalKpis {
  earthquakeCount: number;
  strongestMagnitude: number | null;
  flightCount: number;
  flightsTruncated: boolean;
}

export function deriveKpis(
  quakes: Earthquake[] | undefined,
  flightCount: number | undefined,
  flightsTruncated: boolean
): GlobalKpis {
  return {
    earthquakeCount: quakes?.length ?? 0,
    strongestMagnitude: quakes && quakes.length > 0 ? Math.max(...quakes.map((q) => q.magnitude)) : null,
    flightCount: flightCount ?? 0,
    flightsTruncated,
  };
}
