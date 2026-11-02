import "server-only";
import { normalizeFlights, type AdsbStatesResponse } from "@/features/flights/lib/normalize";
import type { Flight } from "@/features/flights/types";
import { getJson } from "@/features/trip/lib/http";
import { parseFlightQuery, type FlightQuery } from "./query";
import { computeProgress } from "./progress";
import type { AirportRef, FlightTrack, LiveFlight } from "../types";

interface AdsbdbAirport {
  iata_code?: string;
  icao_code?: string;
  name?: string;
  municipality?: string;
  country_iso_name?: string;
  latitude?: number;
  longitude?: number;
}
interface AdsbdbAirline {
  name: string;
  icao: string;
  iata: string;
}
interface AdsbdbRoute {
  response?: { flightroute?: { callsign_iata?: string; airline?: AdsbdbAirline | null; origin?: AdsbdbAirport; destination?: AdsbdbAirport } } | string;
}

const toRef = (a: AdsbdbAirport | undefined): AirportRef | null =>
  a?.iata_code && typeof a.latitude === "number" && typeof a.longitude === "number"
    ? { iata: a.iata_code, icao: a.icao_code ?? null, name: a.name ?? a.iata_code, city: a.municipality ?? "", countryCode: a.country_iso_name ?? "", latitude: a.latitude, longitude: a.longitude }
    : null;

function toLive(f: Flight): LiveFlight {
  return {
    callsign: f.callsign,
    icao24: f.icao24,
    registration: f.registration,
    aircraft: f.aircraftType,
    latitude: f.latitude,
    longitude: f.longitude,
    altitudeFt: f.altitudeM !== null ? Math.round(f.altitudeM * 3.28084) : null,
    onGround: f.onGround,
    speedKt: f.velocityMs !== null ? Math.round(f.velocityMs * 1.94384) : null,
    headingDeg: f.trueTrack !== null ? Math.round(f.trueTrack) : null,
    verticalFpm: f.verticalRateMs !== null ? Math.round(f.verticalRateMs * 196.85) : null,
    lastSeen: f.lastContact,
  };
}

/** When several aircraft share a callsign, the one heard from most recently is the live one. */
function mostRecent(flights: Flight[]): Flight | null {
  return [...flights].sort((a, b) => b.lastContact.localeCompare(a.lastContact))[0] ?? null;
}

async function liveByCallsign(callsign: string): Promise<Flight | null> {
  const raw = await getJson<AdsbStatesResponse>(`https://opendata.adsb.fi/api/v2/callsign/${encodeURIComponent(callsign)}`, 15, "application/json", { timeoutMs: 8000 });
  return raw ? mostRecent(normalizeFlights(raw)) : null;
}

async function liveByRegistration(registration: string): Promise<Flight | null> {
  const raw = await getJson<AdsbStatesResponse>(`https://opendata.adsb.fi/api/v2/registration/${encodeURIComponent(registration)}`, 15, "application/json", { timeoutMs: 8000 });
  return raw ? mostRecent(normalizeFlights(raw)) : null;
}

async function routeFor(callsign: string) {
  const raw = await getJson<AdsbdbRoute>(`https://api.adsbdb.com/v0/callsign/${encodeURIComponent(callsign)}`, 3600);
  return raw && typeof raw.response === "object" ? (raw.response.flightroute ?? null) : null;
}

/** IATA airline codes aren't unique (QQ is two airlines), so we may have several callsign guesses. */
async function airlinesForIata(iata: string): Promise<AdsbdbAirline[]> {
  const raw = await getJson<{ response?: AdsbdbAirline[] | string }>(`https://api.adsbdb.com/v0/airline/${encodeURIComponent(iata)}`, 86_400);
  return Array.isArray(raw?.response) ? raw.response.slice(0, 3) : [];
}

export async function trackFlight(input: string): Promise<FlightTrack | null> {
  const query: FlightQuery | null = parseFlightQuery(input);
  if (!query) return null;

  // Callsigns to try, best guess first.
  let callsigns: { callsign: string; iata: string | null }[] = [];
  let live: Flight | null = null;

  if (query.kind === "callsign") callsigns = [{ callsign: query.callsign, iata: null }];
  else if (query.kind === "flight-number") {
    callsigns = (await airlinesForIata(query.airline)).map((a) => ({ callsign: `${a.icao}${query.number}`, iata: a.iata }));
  } else {
    live = await liveByRegistration(query.registration);
    if (live?.callsign) callsigns = [{ callsign: live.callsign, iata: null }];
  }

  let chosen: { callsign: string; route: Awaited<ReturnType<typeof routeFor>> } | null = null;
  for (const c of callsigns) {
    // Sequential on purpose: adsb.fi allows about one request per second.
    const candidateLive = live ?? (await liveByCallsign(c.callsign));
    const route = await routeFor(c.callsign);
    if (candidateLive || route) {
      live = candidateLive;
      chosen = { callsign: c.callsign, route };
      break;
    }
  }

  const route = chosen?.route ?? null;
  const origin = toRef(route?.origin);
  const destination = toRef(route?.destination);
  const airline = route?.airline ?? null;

  const status: FlightTrack["status"] = live ? (live.onGround ? "on-ground" : "airborne") : route ? "not-tracking" : "not-found";

  return {
    status,
    query: query.text,
    callsign: chosen?.callsign ?? live?.callsign ?? null,
    flightNumber: route?.callsign_iata ?? (query.kind === "flight-number" ? query.text : null),
    airline: airline ? { name: airline.name, iata: airline.iata, icao: airline.icao } : null,
    origin,
    destination,
    live: live ? toLive(live) : null,
    progress:
      live && origin && destination
        ? computeProgress(origin, destination, { latitude: live.latitude, longitude: live.longitude, speedKt: live.velocityMs !== null ? live.velocityMs * 1.94384 : null, onGround: live.onGround })
        : null,
    generatedAt: new Date().toISOString(),
  };
}
