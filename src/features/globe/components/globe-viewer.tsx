"use client";

import "cesium/Build/Cesium/Widgets/widgets.css";
import { useMemo } from "react";
import { Viewer } from "resium";
import { ImageryLayer, UrlTemplateImageryProvider } from "cesium";
import { BASEMAP_CREDIT, BASEMAP_SUBDOMAINS, BASEMAP_TILE_URL_TEMPLATE } from "../lib/cesium-config";
import { useGlobeUi } from "../context/globe-ui-context";
import { CameraBoundsWatcher } from "./camera-bounds-watcher";
import { GlobalClickHandler } from "./global-click-handler";
import { GlobeAutoRotate } from "./globe-auto-rotate";
import { useDemoModeOptional } from "@/features/demo/context/demo-mode-context";
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
  const demo = useDemoModeOptional();

  // Auto-rotate only exists in demo mode (explicit toolbar toggle / guided
  // script). The main app never rotates the camera on its own — it used to,
  // via an idle timer, and that timer kept fighting search: it had no way
  // to tell "the user deliberately navigated somewhere" apart from "nobody's
  // touched the globe in a while," so it would drift off a searched city.
  const autoRotateEnabled = demo ? demo.guidedRotateOverride ?? demo.autoRotate : false;
  const handleInteract = demo
    ? () => {
        if (demo.isGuidedDemoRunning) demo.stopGuidedDemo();
      }
    : undefined;

  const baseLayer = useMemo(
    () =>
      new ImageryLayer(
        new UrlTemplateImageryProvider({
          url: BASEMAP_TILE_URL_TEMPLATE,
          subdomains: BASEMAP_SUBDOMAINS,
          credit: BASEMAP_CREDIT,
        })
      ),
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
      {demo && <GlobeAutoRotate enabled={autoRotateEnabled} onInteract={handleInteract} />}
      <EarthquakeLayer active={layers.earthquakes} />
      <WeatherLayer active={layers.weather} />
      <FlightLayer active={layers.flights} />
      <AirQualityLayer active={layers.airQuality} />
      <WildfireLayer active={layers.wildfires} />
    </Viewer>
  );
}
