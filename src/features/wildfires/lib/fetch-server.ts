import "server-only";
import { parseFirmsCsv } from "./parse-csv";
import type { WildfiresResponse } from "../types";

const FIRMS_SOURCE = "VIIRS_SNPP_NRT";
const FIRMS_DAY_RANGE = 1;

export async function fetchWildfiresData(): Promise<WildfiresResponse> {
  const mapKey = process.env.NASA_FIRMS_MAP_KEY;

  if (!mapKey) {
    return { generatedAt: new Date().toISOString(), count: 0, configured: false, hotspots: [] };
  }

  const url = `https://firms.modaps.eosdis.gov/api/area/csv/${mapKey}/${FIRMS_SOURCE}/world/${FIRMS_DAY_RANGE}`;
  const res = await fetch(url, { next: { revalidate: 1800 } });

  if (!res.ok) {
    return { generatedAt: new Date().toISOString(), count: 0, configured: true, hotspots: [] };
  }

  const csv = await res.text();
  const hotspots = parseFirmsCsv(csv);

  return { generatedAt: new Date().toISOString(), count: hotspots.length, configured: true, hotspots };
}
