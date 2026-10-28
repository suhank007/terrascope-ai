"use client";

import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { AirQualityList, EarthquakeList, FlightList, WeatherList, WildfireList } from "./signal-lists";

/** The Signal Explorer list for whichever layer is focused. */
export function ExplorerForLayer() {
  const { focusedLayer } = useGlobeUi();
  switch (focusedLayer) {
    case "earthquakes":
      return <EarthquakeList />;
    case "wildfires":
      return <WildfireList />;
    case "flights":
      return <FlightList />;
    case "weather":
      return <WeatherList />;
    case "airQuality":
      return <AirQualityList />;
  }
}
