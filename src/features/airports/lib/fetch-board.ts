import "server-only";
import { getJsonDetailed, getText } from "@/features/trip/lib/http";
import { getAirport } from "./dataset";
import { parseFaaStatus } from "./faa";
import { computeOutlook } from "./outlook";
import { parseMetar } from "./weather";
import type { BoardRow, Metar } from "../types";

const FAST = { timeoutMs: 8000 };
const FAA_COUNTRIES = new Set(["US", "PR", "VI", "GU", "MP", "AS"]);

/**
 * A compact status line for several airports at once: one batched weather
 * request and one FAA request, however many airports are asked for. It skips the
 * TAF, traffic and forecast, so it stays fast enough for a front page.
 */
export async function fetchBoard(codes: string[]): Promise<BoardRow[]> {
  const airports = codes.map(getAirport).filter((a): a is NonNullable<typeof a> => a !== null);
  if (airports.length === 0) return [];

  const icaos = airports.map((a) => a.icao || a.iata);
  const [metars, faaXml] = await Promise.all([
    getJsonDetailed<unknown[]>(`https://aviationweather.gov/api/data/metar?ids=${icaos.map(encodeURIComponent).join(",")}&format=json`, 120, "application/json", FAST),
    airports.some((a) => FAA_COUNTRIES.has(a.countryCode)) ? getText("https://nasstatus.faa.gov/api/airport-status-information", 120, FAST) : Promise.resolve(null),
  ]);

  const byIcao = new Map<string, Metar>();
  for (const row of Array.isArray(metars.data) ? metars.data : []) {
    const metar = parseMetar(row as Parameters<typeof parseMetar>[0]);
    if (metar) byIcao.set(metar.icao, metar);
  }

  return airports.map((airport) => {
    const inFaa = FAA_COUNTRIES.has(airport.countryCode);
    const metar = byIcao.get(airport.icao || airport.iata) ?? null;
    const outlook = computeOutlook({
      metar,
      taf: null,
      faa: inFaa && faaXml ? parseFaaStatus(faaXml, airport.iata) : null,
      faaState: !inFaa ? "not-covered" : faaXml ? "covered" : "outage",
    });
    return {
      iata: airport.iata,
      city: airport.city,
      countryCode: airport.countryCode,
      level: outlook.level,
      headline: outlook.headline,
      reason: outlook.reasons[0]?.text ?? null,
      category: metar?.flightCategory ?? null,
      basis: outlook.basis,
    };
  });
}
