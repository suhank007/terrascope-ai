"use client";

import "cesium/Build/Cesium/Widgets/widgets.css";
import { useMemo } from "react";
import { Viewer } from "resium";
import { ImageryLayer, OpenStreetMapImageryProvider } from "cesium";
import { OSM_TILE_URL } from "../lib/cesium-config";
import { useGlobeUi } from "../context/globe-ui-context";
import { CameraBoundsWatcher } from "./camera-bounds-watcher";
import { GlobalClickHandler } from "./global-click-handler";
import { EarthquakeLayer } from "@/features/earthquakes/components/earthquake-layer";
import { WeatherLayer } from "@/features/weather/components/weather-layer";
import { FlightLayer } from "@/features/flights/components/flight-layer";
import { AirQualityLayer } from "@/features/air-quality/components/air-quality-layer";
import { WildfireLayer } from "@/features/wildfires/components/wildfire-layer";

if (typeof window !== "undefined") {
  window.CESIUM_BASE_URL = "/cesium";
}

export function GlobeViewer() {
  const { layers } = useGlobeUi();

  const baseLayer = useMemo(
    () => new ImageryLayer(new OpenStreetMapImageryProvider({ url: OSM_TILE_URL })),
    []
  );

  return (
    <Viewer
      full
      baseLayer={baseLayer}
      baseLayerPicker={false}
      animation={false}
      timeline={false}
      geocoder={false}
      homeButton={false}
      sceneModePicker={false}
      navigationHelpButton={false}
      fullscreenButton={false}
      infoBox={false}
      selectionIndicator={false}
    >
      <CameraBoundsWatcher />
      <GlobalClickHandler />
      {layers.earthquakes && <EarthquakeLayer />}
      {layers.weather && <WeatherLayer />}
      {layers.flights && <FlightLayer />}
      {layers.airQuality && <AirQualityLayer />}
      {layers.wildfires && <WildfireLayer />}
    </Viewer>
  );
}
