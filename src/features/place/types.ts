import type { Earthquake } from "@/features/earthquakes/types";
import type { WildfireHotspot } from "@/features/wildfires/types";
import type { ForecastDay, Section } from "@/features/trip/types";

export type PlaceScope = "city" | "region";

/** A searched place, as the globe knows it. */
export interface SearchedPlace {
  name: string;
  displayName: string;
  /** ISO 3166-1 alpha-2, when the geocoder knows it; enables the trip brief link. */
  countryCode: string | null;
  latitude: number;
  longitude: number;
  scope: PlaceScope;
  /** How far we look for quakes and fires around it. */
  quakeRadiusKm: number;
  fireRadiusKm: number;
}

export interface PlaceWeather {
  observedAt: string;
  timezone: string;
  temperatureC: number;
  apparentC: number;
  humidityPct: number;
  windKph: number;
  windDirectionDeg: number;
  precipitationMm: number;
  weatherCode: number;
  isDay: boolean;
  days: ForecastDay[];
}

export interface Pollutant {
  key: string;
  label: string;
  value: number;
  unit: string;
}

export interface PlaceAirQuality {
  usAqi: number;
  label: string;
  color: string;
  observedAt: string;
  pollutants: Pollutant[];
}

export type PlaceQuake = Earthquake & { distanceKm: number };

export interface PlaceQuakes {
  radiusKm: number;
  total: number;
  strongest: number | null;
  quakes: PlaceQuake[];
}

export type PlaceFire = WildfireHotspot & { distanceKm: number };

export interface PlaceFires {
  radiusKm: number;
  total: number;
  nearestKm: number | null;
  strongestFrp: number | null;
  fires: PlaceFire[];
}

export interface PlaceReport {
  weather: Section<PlaceWeather>;
  airQuality: Section<PlaceAirQuality>;
  earthquakes: Section<PlaceQuakes>;
  wildfires: Section<PlaceFires>;
}
