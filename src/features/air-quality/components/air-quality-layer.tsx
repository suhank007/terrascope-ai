"use client";

import { WEATHER_CITIES } from "@/features/weather/lib/cities";
import { AirQualityCityEntity } from "./air-quality-city-entity";
import { useFadeVisibility } from "@/features/globe/hooks/use-fade-visibility";

export function AirQualityLayer({ active }: { active: boolean }) {
  const { mounted, opacity } = useFadeVisibility(active);

  if (!mounted) return null;

  return (
    <>
      {WEATHER_CITIES.map((city) => (
        <AirQualityCityEntity key={city.id} city={city} active={active} opacity={opacity} />
      ))}
    </>
  );
}
