import "server-only";
import { normalizeFlights, type OpenSkyStatesResponse } from "./normalize";
import { capByCount, clampBbox } from "./sampling";
import type { BBox, FlightsResponse } from "../types";

function degradedResponse(): FlightsResponse {
  return { generatedAt: new Date().toISOString(), count: 0, truncated: false, degraded: true, flights: [] };
}

export async function fetchFlightsData(bbox: BBox): Promise<FlightsResponse> {
  const clamped = clampBbox(bbox);
  const url = `https://opensky-network.org/api/states/all?lamin=${clamped.south}&lomin=${clamped.west}&lamax=${clamped.north}&lomax=${clamped.east}`;

  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    // OpenSky's anonymous tier rate-limits (429/503) fairly often — treat as a
    // soft "degraded" state rather than a hard error so the UI stays calm.
    return degradedResponse();
  }

  let raw: OpenSkyStatesResponse;
  try {
    raw = await res.json();
  } catch {
    return degradedResponse();
  }

  const normalized = normalizeFlights(raw);
  const { flights, truncated } = capByCount(normalized);

  return { generatedAt: new Date().toISOString(), count: flights.length, truncated, degraded: false, flights };
}
