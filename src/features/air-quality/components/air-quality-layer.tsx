"use client";

import { WEATHER_CITIES } from "@/features/weather/lib/cities";
import { AirQualityCityEntity } from "./air-quality-city-entity";

export function AirQualityLayer() {
  return (
    <>
      {WEATHER_CITIES.map((city) => (
        <AirQualityCityEntity key={city.id} city={city} />
      ))}
    </>
  );
}
