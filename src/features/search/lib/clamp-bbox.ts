import type { GeocodeResult } from "../types";

// Some countries' Nominatim bbox spans nearly the whole globe because it
// includes far-flung overseas territories (e.g. France's bbox covers French
// Polynesia). Clamping the span around the bbox's own center keeps a fly-to
// focused on the place itself instead of zooming out to "see everything".
const MAX_BBOX_SPAN_DEG = 40;

export function clampBboxSpan(bbox: NonNullable<GeocodeResult["bbox"]>) {
  const width = bbox.east - bbox.west;
  const height = bbox.north - bbox.south;
  if (width <= MAX_BBOX_SPAN_DEG && height <= MAX_BBOX_SPAN_DEG) return bbox;

  const centerLon = (bbox.east + bbox.west) / 2;
  const centerLat = (bbox.north + bbox.south) / 2;
  const half = MAX_BBOX_SPAN_DEG / 2;
  return {
    west: Math.max(centerLon - half, -180),
    east: Math.min(centerLon + half, 180),
    south: Math.max(centerLat - half, -90),
    north: Math.min(centerLat + half, 90),
  };
}
