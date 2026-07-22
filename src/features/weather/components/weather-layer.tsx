"use client";

import { WEATHER_CITIES } from "../lib/cities";
import { WeatherCityEntity } from "./weather-city-entity";
import { useFadeVisibility } from "@/features/globe/hooks/use-fade-visibility";

export function WeatherLayer({ active }: { active: boolean }) {
  const { mounted, opacity } = useFadeVisibility(active);

  if (!mounted) return null;

  return (
    <>
      {WEATHER_CITIES.map((city) => (
        <WeatherCityEntity key={city.id} city={city} active={active} opacity={opacity} />
      ))}
    </>
  );
}
