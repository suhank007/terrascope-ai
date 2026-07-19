"use client";

import { WEATHER_CITIES } from "../lib/cities";
import { WeatherCityEntity } from "./weather-city-entity";

export function WeatherLayer() {
  return (
    <>
      {WEATHER_CITIES.map((city) => (
        <WeatherCityEntity key={city.id} city={city} />
      ))}
    </>
  );
}
