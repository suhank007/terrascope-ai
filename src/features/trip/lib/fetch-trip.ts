import "server-only";
import { fetchAirQualityData } from "@/features/air-quality/lib/fetch-server";
import { aqiHexColor, aqiLabel } from "@/features/air-quality/lib/aqi-scale";
import { fetchEarthquakesData } from "@/features/earthquakes/lib/fetch-server";
import { fetchWildfiresData } from "@/features/wildfires/lib/fetch-server";
import { getJson, getText } from "./http";
import { parseFcdoCountry, parseFcdoIndex, parseStateAdvisories } from "./parse-advisories";
import { noticesForCountry, outbreaksForCountry, parseCdcNotices, parseWhoOutbreaks } from "./parse-health";
import { computeHazards } from "./hazards";
import { parseSights, sightsQuery, type SparqlResults } from "./sights";
import type {
  AdvisoriesData,
  AirQualityData,
  CountryEssentials,
  CurrencyData,
  Destination,
  ForecastData,
  HazardsData,
  HealthData,
  Section,
  Sight,
} from "../types";

const HOUR = 3600;
const unavailable = (reason: string): { status: "unavailable"; reason: string } => ({ status: "unavailable", reason });

export async function fetchAdvisories(code: string): Promise<Section<AdvisoriesData>> {
  const [index, stateXml] = await Promise.all([
    getJson<Parameters<typeof parseFcdoIndex>[0]>("https://www.gov.uk/api/content/foreign-travel-advice", 6 * HOUR),
    getText("https://travel.state.gov/_res/rss/TAsTWs.xml", 6 * HOUR),
  ]);

  const missing: string[] = [];

  let uk: AdvisoriesData["uk"] = null;
  if (!index) missing.push("UK FCDO");
  else {
    const path = parseFcdoIndex(index)[code];
    if (path) {
      const doc = await getJson<Parameters<typeof parseFcdoCountry>[0]>(`https://www.gov.uk/api/content${path}`, HOUR);
      if (doc) uk = parseFcdoCountry(doc);
      else missing.push("UK FCDO");
    }
  }

  let us: AdvisoriesData["us"] = null;
  if (!stateXml) missing.push("US State Dept");
  else us = parseStateAdvisories(stateXml)[code] ?? null;

  if (missing.length === 2) return unavailable("Government advisory feeds didn't respond.");
  return { status: "ok", data: { uk, us, missing: missing.length ? missing : undefined } };
}

export async function fetchHealth(code: string): Promise<Section<HealthData>> {
  const [cdcXml, who] = await Promise.all([
    getText("https://wwwnc.cdc.gov/travel/rss/notices.xml", 6 * HOUR),
    getJson<Parameters<typeof parseWhoOutbreaks>[0]>(
      "https://www.who.int/api/news/diseaseoutbreaknews?sf_culture=en&$top=80&$orderby=PublicationDateAndTime%20desc&$select=Title,PublicationDateAndTime,ItemDefaultUrl",
      6 * HOUR
    ),
  ]);

  const missing: string[] = [];
  if (!cdcXml) missing.push("CDC");
  if (!who) missing.push("WHO");
  if (missing.length === 2) return unavailable("Health notice feeds didn't respond.");

  return {
    status: "ok",
    data: {
      notices: cdcXml ? noticesForCountry(parseCdcNotices(cdcXml), code) : [],
      outbreaks: who ? outbreaksForCountry(parseWhoOutbreaks(who), code) : [],
      missing: missing.length ? missing : undefined,
    },
  };
}

interface OpenMeteoDaily {
  timezone?: string;
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: (number | null)[];
    wind_speed_10m_max?: (number | null)[];
  };
}

export async function fetchForecast(lat: number, lon: number): Promise<Section<ForecastData>> {
  const params = "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max";
  const raw = await getJson<OpenMeteoDaily>(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=${params}&timezone=auto&forecast_days=7`,
    HOUR
  );
  const d = raw?.daily;
  if (!raw || !d?.time || !d.weather_code || !d.temperature_2m_max || !d.temperature_2m_min) {
    return unavailable("The forecast service didn't respond.");
  }

  return {
    status: "ok",
    data: {
      timezone: raw.timezone ?? "UTC",
      days: d.time.map((date, i) => ({
        date,
        weatherCode: d.weather_code![i],
        maxC: d.temperature_2m_max![i],
        minC: d.temperature_2m_min![i],
        rainChancePct: d.precipitation_probability_max?.[i] ?? null,
        windMaxKph: d.wind_speed_10m_max?.[i] ?? null,
      })),
    },
  };
}

export async function fetchAirQualitySection(lat: number, lon: number): Promise<Section<AirQualityData>> {
  try {
    const data = await fetchAirQualityData(lat, lon);
    if (!data) return unavailable("The air quality service didn't respond.");
    const { usAqi, observedAt } = data.current;
    return { status: "ok", data: { usAqi, label: aqiLabel(usAqi), color: aqiHexColor(usAqi), observedAt } };
  } catch {
    return unavailable("The air quality service didn't respond.");
  }
}

export async function fetchHazards(dest: Destination): Promise<Section<HazardsData>> {
  try {
    const [quakes, wildfires] = await Promise.all([fetchEarthquakesData(), fetchWildfiresData()]);
    return {
      status: "ok",
      data: computeHazards(dest, quakes.quakes, wildfires.configured ? wildfires.hotspots : null),
    };
  } catch {
    return unavailable("The live hazard feeds didn't respond.");
  }
}

export async function fetchCurrency(country: CountryEssentials, home: string): Promise<Section<CurrencyData>> {
  const code = country.currencyCode;
  if (!code) return unavailable("This country has no single national currency on record.");
  if (code === home) return { status: "ok", data: { home, code, rate: 1, date: new Date().toISOString().slice(0, 10) } };

  const raw = await getJson<{ date?: string; rates?: Record<string, number> }>(
    `https://api.frankfurter.dev/v1/latest?base=${home}&symbols=${code}`,
    HOUR
  );
  const rate = raw?.rates?.[code];
  if (!raw || typeof rate !== "number") {
    return unavailable(`No published exchange rate between ${home} and ${code}.`);
  }
  return { status: "ok", data: { home, code, rate, date: raw.date ?? "" } };
}

/** Widening search: big cities answer at 10 km, smaller towns need a wider net and a lower bar. */
const SIGHT_PASSES: { radiusKm: number; minLanguages: number }[] = [
  { radiusKm: 10, minLanguages: 40 },
  { radiusKm: 25, minLanguages: 20 },
  { radiusKm: 50, minLanguages: 10 },
];

export async function fetchSights(dest: Destination): Promise<Section<Sight[]>> {
  let best: Sight[] = [];
  let anyResponse = false;

  for (const pass of SIGHT_PASSES) {
    const query = sightsQuery(dest.latitude, dest.longitude, pass.radiusKm, pass.minLanguages);
    const raw = await getJson<SparqlResults>(
      `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`,
      24 * HOUR,
      "application/sparql-results+json"
    );
    if (!raw) continue;
    anyResponse = true;

    const sights = parseSights(raw, dest, 10);
    if (sights.length > best.length) best = sights;
    if (best.length >= 6) break;
  }

  if (!anyResponse) return unavailable("The places service didn't respond.");
  return { status: "ok", data: best };
}
