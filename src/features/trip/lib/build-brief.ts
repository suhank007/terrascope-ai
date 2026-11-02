import "server-only";
import { z } from "zod";
import { nearestAirports } from "@/features/airports/lib/dataset";
import { countryEssentials } from "./countries";
import {
  fetchAdvisories,
  fetchAirQualitySection,
  fetchCurrency,
  fetchForecast,
  fetchHazards,
  fetchHealth,
} from "./fetch-trip";
import { buildTripLinks } from "./links";
import { computeVerdict } from "./verdict";
import type { Destination, TripBrief } from "../types";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const tripParamsSchema = z.object({
  name: z.string().trim().min(1).max(80),
  cc: z.string().length(2).transform((v) => v.toUpperCase()),
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
  home: z
    .string()
    .regex(/^[A-Za-z]{3}$/)
    .transform((v) => v.toUpperCase())
    .default("USD"),
  from: date.optional(),
  to: date.optional(),
});

export type TripParams = z.infer<typeof tripParamsSchema>;

/** Builds the brief (everything but the slower places list, which has its own endpoint). Every section fails on its own; only a country we
 *  don't recognise is a hard error, because nothing country-level can work. */
export async function buildTripBrief(params: TripParams): Promise<TripBrief | null> {
  const country = countryEssentials(params.cc);
  if (!country) return null;

  const destination: Destination = {
    name: params.name,
    countryCode: country.code,
    countryName: country.name,
    latitude: Math.round(params.lat * 10_000) / 10_000,
    longitude: Math.round(params.lon * 10_000) / 10_000,
  };

  const [advisories, health, forecast, airQuality, hazards, currency] = await Promise.all([
    fetchAdvisories(country.code),
    fetchHealth(country.code),
    fetchForecast(destination.latitude, destination.longitude),
    fetchAirQualitySection(destination.latitude, destination.longitude),
    fetchHazards(destination),
    fetchCurrency(country, params.home),
  ]);

  return {
    destination,
    generatedAt: new Date().toISOString(),
    verdict: computeVerdict({ advisories, health, hazards, airQuality, forecast }),
    country,
    advisories,
    health,
    forecast,
    airQuality,
    hazards,
    currency,
    // Static data, so no feed can fail: larger airports first within the nearest few.
    airports: nearestAirports(destination.latitude, destination.longitude, 4, 150).map((a) => ({
      iata: a.iata,
      name: a.name,
      city: a.city,
      distanceKm: a.distanceKm,
      size: a.size,
    })),
    links: buildTripLinks(destination, { from: params.from, to: params.to }),
  };
}
