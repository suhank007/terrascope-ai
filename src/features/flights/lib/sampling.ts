import type { BBox, Flight } from "../types";

const MAX_SPAN_DEG = 10;
const QUANTIZE_STEP_DEG = 0.5;
const MAX_RENDERED = 300;

/**
 * Clamps a camera view rectangle to a fixed max span so we never query
 * OpenSky's anonymous tier (400 credits/day, cost scales with queried area)
 * for a whole-globe area. If the real view is smaller, it's used as-is.
 * Note: does not special-case antimeridian-crossing rectangles (west > east) —
 * a rare edge case at the zoom levels flights are enabled at.
 */
export function clampBbox(bounds: BBox): BBox {
  const width = bounds.east - bounds.west;
  const height = bounds.north - bounds.south;
  if (width > 0 && width <= MAX_SPAN_DEG && height <= MAX_SPAN_DEG) return bounds;

  const centerLon = (bounds.east + bounds.west) / 2;
  const centerLat = (bounds.north + bounds.south) / 2;
  const half = MAX_SPAN_DEG / 2;

  return {
    west: Math.max(centerLon - half, -180),
    east: Math.min(centerLon + half, 180),
    south: Math.max(centerLat - half, -90),
    north: Math.min(centerLat + half, 90),
  };
}

/** Rounds a bbox to the nearest 0.5° so small pans don't trigger a new query key. */
export function quantizeBbox(bounds: BBox): BBox {
  const q = (v: number) => Math.round(v / QUANTIZE_STEP_DEG) * QUANTIZE_STEP_DEG;
  return { west: q(bounds.west), south: q(bounds.south), east: q(bounds.east), north: q(bounds.north) };
}

/** Server-side safety net: prioritizes actively-moving aircraft over stale/parked ones. */
export function capByCount(flights: Flight[]): { flights: Flight[]; truncated: boolean } {
  if (flights.length <= MAX_RENDERED) return { flights, truncated: false };
  const sorted = [...flights].sort((a, b) => (b.velocityMs ?? 0) - (a.velocityMs ?? 0));
  return { flights: sorted.slice(0, MAX_RENDERED), truncated: true };
}
