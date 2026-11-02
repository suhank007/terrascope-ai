import "server-only";
import { normalizeFlights, type AdsbStatesResponse } from "@/features/flights/lib/normalize";
import { fetchForecast } from "@/features/trip/lib/fetch-trip";
import { getJson, getJsonDetailed, getText } from "@/features/trip/lib/http";
import { parseFaaStatus } from "./faa";
import { computeOutlook } from "./outlook";
import { summarizeTraffic } from "./traffic";
import { parseMetar, summarizeTaf } from "./weather";
import type { Airport, AirportBrief, AirportSection, AirportTraffic, FaaStatus, Metar, TafOutlook } from "../types";

const unavailable = (reason: string): { status: "unavailable"; reason: string } => ({ status: "unavailable", reason });

/** The FAA feed covers US airports and territories only. */
const FAA_COUNTRIES = new Set(["US", "PR", "VI", "GU", "MP", "AS"]);
const TRAFFIC_RADIUS_NM = 25;
/** Weather and traffic feeds answer in well under a second when healthy; don't make a page wait 20s on a bad day. */
const FAST = { timeoutMs: 8000 };

/** "No report" (the airport simply doesn't publish one) and "the service is down" are different problems. */
function noReportOrOutage<T>(fetched: { status: number; data: T | null }, noun: string): { status: "unavailable"; reason: string } {
  return fetched.status === 204 || (fetched.status === 200 && fetched.data === null)
    ? unavailable(`No current ${noun} is published for this airport.`)
    : unavailable(`The aviation weather service didn't respond, so the ${noun} couldn't be checked.`);
}

export async function fetchMetar(icao: string): Promise<AirportSection<Metar>> {
  const fetched = await getJsonDetailed<unknown[]>(`https://aviationweather.gov/api/data/metar?ids=${encodeURIComponent(icao)}&format=json`, 120, "application/json", FAST);
  const row = Array.isArray(fetched.data) ? fetched.data[0] : null;
  const metar = row ? parseMetar(row as Parameters<typeof parseMetar>[0]) : null;
  if (metar) return { status: "ok", data: metar };
  return noReportOrOutage({ status: fetched.status, data: row ?? null }, "weather report");
}

export async function fetchTaf(icao: string): Promise<AirportSection<TafOutlook>> {
  const fetched = await getJsonDetailed<unknown[]>(`https://aviationweather.gov/api/data/taf?ids=${encodeURIComponent(icao)}&format=json`, 600, "application/json", FAST);
  const row = Array.isArray(fetched.data) ? fetched.data[0] : null;
  const taf = row ? summarizeTaf(row as Parameters<typeof summarizeTaf>[0]) : null;
  if (taf) return { status: "ok", data: taf };
  return noReportOrOutage({ status: fetched.status, data: row ?? null }, "forecast (TAF)");
}

export async function fetchFaa(iata: string): Promise<AirportSection<FaaStatus>> {
  const xml = await getText("https://nasstatus.faa.gov/api/airport-status-information", 120, FAST);
  return xml ? { status: "ok", data: parseFaaStatus(xml, iata) } : unavailable("The FAA status feed didn't respond.");
}

export async function fetchTraffic(airport: Airport): Promise<AirportSection<AirportTraffic>> {
  const raw = await getJson<AdsbStatesResponse>(
    `https://opendata.adsb.fi/api/v3/lat/${airport.latitude}/lon/${airport.longitude}/dist/${TRAFFIC_RADIUS_NM}`,
    30,
    "application/json",
    FAST
  );
  if (!raw) return unavailable("Live aircraft data didn't respond (adsb.fi allows about one request a second).");
  return { status: "ok", data: summarizeTraffic(normalizeFlights(raw), TRAFFIC_RADIUS_NM) };
}

export async function buildAirportBrief(airport: Airport): Promise<AirportBrief> {
  const inFaaCoverage = FAA_COUNTRIES.has(airport.countryCode);
  const icao = airport.icao || airport.iata;

  const [metar, taf, faa, traffic, forecast] = await Promise.all([
    fetchMetar(icao),
    fetchTaf(icao),
    inFaaCoverage ? fetchFaa(airport.iata) : Promise.resolve(null),
    fetchTraffic(airport),
    fetchForecast(airport.latitude, airport.longitude),
  ]);

  const outlook = computeOutlook({
    metar: metar.status === "ok" ? metar.data : null,
    taf: taf.status === "ok" ? taf.data : null,
    faa: faa?.status === "ok" ? faa.data : null,
    faaState: !inFaaCoverage ? "not-covered" : faa?.status === "ok" ? "covered" : "outage",
  });

  return { airport, generatedAt: new Date().toISOString(), outlook, metar, taf, faa, traffic, forecast };
}
