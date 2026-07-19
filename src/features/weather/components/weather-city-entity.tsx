"use client";

import { useEffect } from "react";
import { Cartesian3, Color } from "cesium";
import { Entity, PointGraphics } from "resium";
import { useWeather } from "../hooks/use-weather";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { colorForTemperature } from "../lib/color-scale";
import type { WeatherCity } from "../types";

export function WeatherCityEntity({ city }: { city: WeatherCity }) {
  const { data } = useWeather(city.lat, city.lon);
  const { citiesRef } = useGlobeUi();

  useEffect(() => {
    const cities = citiesRef.current;
    cities.set(city.id, city);
    return () => {
      cities.delete(city.id);
    };
  }, [city, citiesRef]);

  const color = data ? colorForTemperature(data.current.temperatureC) : Color.fromCssColorString("#8891a1");

  return (
    <Entity id={city.id} position={Cartesian3.fromDegrees(city.lon, city.lat)}>
      <PointGraphics pixelSize={9} color={color} outlineColor={Color.BLACK} outlineWidth={1} />
    </Entity>
  );
}
