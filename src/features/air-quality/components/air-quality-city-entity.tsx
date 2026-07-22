"use client";

import { useEffect } from "react";
import { Cartesian3, Color } from "cesium";
import { Entity, PointGraphics } from "resium";
import { useAirQuality } from "../hooks/use-air-quality";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { aqiCesiumColor } from "../lib/aqi-scale";
import type { WeatherCity } from "@/features/weather/types";

export function AirQualityCityEntity({
  city,
  active,
  opacity,
}: {
  city: WeatherCity;
  active: boolean;
  opacity: number;
}) {
  const entityId = `aqi-${city.id}`;
  const { data } = useAirQuality(city.lat, city.lon, active);
  const { airQualityCitiesRef } = useGlobeUi();

  useEffect(() => {
    const cities = airQualityCitiesRef.current;
    cities.set(entityId, city);
    return () => {
      cities.delete(entityId);
    };
  }, [city, entityId, airQualityCitiesRef]);

  const color = data ? aqiCesiumColor(data.current.usAqi) : Color.fromCssColorString("#8891a1");

  return (
    <Entity id={entityId} position={Cartesian3.fromDegrees(city.lon, city.lat)}>
      <PointGraphics
        pixelSize={9}
        color={color.withAlpha(opacity)}
        outlineColor={Color.BLACK.withAlpha(opacity)}
        outlineWidth={1}
      />
    </Entity>
  );
}
