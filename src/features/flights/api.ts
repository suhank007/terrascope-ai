import { fetchJson } from "@/lib/fetcher";
import type { BBox, FlightsResponse } from "./types";

export function fetchFlights(bbox: BBox): Promise<FlightsResponse> {
  const params = new URLSearchParams({
    laMin: bbox.south.toFixed(2),
    loMin: bbox.west.toFixed(2),
    laMax: bbox.north.toFixed(2),
    loMax: bbox.east.toFixed(2),
  });
  return fetchJson<FlightsResponse>(`/api/flights?${params.toString()}`);
}
