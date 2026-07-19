import "server-only";
import { parseFirmsCsv } from "./parse-csv";
import type { WildfiresResponse } from "../types";

const FIRMS_SOURCE = "VIIRS_SNPP_NRT";
const FIRMS_DAY_RANGE = 1;

function degradedResponse(): WildfiresResponse {
  return { generatedAt: new Date().toISOString(), count: 0, configured: true, hotspots: [] };
}

export async function fetchWildfiresData(): Promise<WildfiresResponse> {
  const mapKey = process.env.NASA_FIRMS_MAP_KEY;

  if (!mapKey) {
    return { generatedAt: new Date().toISOString(), count: 0, configured: false, hotspots: [] };
  }

  const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${mapKey}/${FIRMS_SOURCE}/world/${FIRMS_DAY_RANGE}`;

  let res: Response;
  try {
    res = await fetch(url, { next: { revalidate: 1800 } });
  } catch {
    // Network-level failure (DNS, connection refused, timeout) — degrade
    // the same way as a bad HTTP response rather than throwing and 500ing
    // the route.
    return degradedResponse();
  }

  if (!res.ok) {
    return degradedResponse();
  }

  const csv = await res.text();
  const hotspots = parseFirmsCsv(csv);

  return { generatedAt: new Date().toISOString(), count: hotspots.length, configured: true, hotspots };
}
