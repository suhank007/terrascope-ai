import "server-only";
import { normalizeFlights, type AdsbStatesResponse } from "./normalize";
import { bboxToPointRadius, capByCount, clampBbox } from "./sampling";
import type { BBox, FlightsResponse } from "../types";

// OpenSky (the original data source) blocks connections from Vercel's
// network entirely — confirmed via production logs, both the states
// endpoint and its OAuth2 token host time out. adsb.fi is a free,
// keyless, community-run mirror with the same underlying ADS-B data and a
// much more generous rate limit; no auth needed.
const STATES_URL = "https://opendata.adsb.fi/api/v3";

function degradedResponse(): FlightsResponse {
  return { generatedAt: new Date().toISOString(), count: 0, truncated: false, degraded: true, flights: [] };
}

export async function fetchFlightsData(bbox: BBox): Promise<FlightsResponse> {
  const clamped = clampBbox(bbox);
  const { lat, lon, distNm } = bboxToPointRadius(clamped);
  const url = `${STATES_URL}/lat/${lat}/lon/${lon}/dist/${distNm}`;

  let res: Response;
  try {
    res = await fetch(url, { next: { revalidate: 60 } });
  } catch (err) {
    console.error("[adsb.fi] fetch failed:", err);
    return degradedResponse();
  }

  if (!res.ok) {
    // adsb.fi rate-limits to 1 req/s — treat as a soft "degraded" state
    // rather than a hard error so the UI stays calm.
    console.error("[adsb.fi] endpoint returned", res.status, await res.text().catch(() => ""));
    return degradedResponse();
  }

  let raw: AdsbStatesResponse;
  try {
    raw = await res.json();
  } catch {
    return degradedResponse();
  }

  const normalized = normalizeFlights(raw);
  const { flights, truncated } = capByCount(normalized);

  return { generatedAt: new Date().toISOString(), count: flights.length, truncated, degraded: false, flights };
}
