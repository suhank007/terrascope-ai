import "server-only";
import { normalizeGeocodeResults } from "./normalize";
import type { GeocodeResponse } from "../types";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const RESULT_LIMIT = 6;

function degradedResponse(): GeocodeResponse {
  return { results: [] };
}

export async function fetchGeocodeResults(query: string): Promise<GeocodeResponse> {
  // accept-language=en matches the basemap's English-labels choice (see
  // cesium-config.ts) — Nominatim defaults to each place's local-script name
  // otherwise (e.g. "東京都" instead of "Tokyo").
  const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=${RESULT_LIMIT}&accept-language=en`;

  let res: Response;
  try {
    res = await fetch(url, {
      // Nominatim's usage policy requires a descriptive User-Agent identifying
      // the application — see https://operations.osmfoundation.org/policies/nominatim/
      headers: { "User-Agent": "TerraScope-AI/1.0 (https://terrascope-ai.vercel.app)" },
      next: { revalidate: 3600 },
    });
  } catch {
    return degradedResponse();
  }

  if (!res.ok) {
    return degradedResponse();
  }

  let raw: Parameters<typeof normalizeGeocodeResults>[0];
  try {
    raw = await res.json();
  } catch {
    return degradedResponse();
  }

  return { results: normalizeGeocodeResults(raw) };
}
