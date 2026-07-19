"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import type { Earthquake } from "@/features/earthquakes/types";
import type { Flight, BBox } from "@/features/flights/types";
import type { WeatherCity } from "@/features/weather/types";
import type { WildfireHotspot } from "@/features/wildfires/types";
import type { SelectedEntity } from "@/features/side-panel/types";

export interface Layers {
  earthquakes: boolean;
  weather: boolean;
  flights: boolean;
  airQuality: boolean;
  wildfires: boolean;
}

interface GlobeUiContextValue {
  selectedEntity: SelectedEntity | null;
  setSelectedEntity: (entity: SelectedEntity | null) => void;
  layers: Layers;
  toggleLayer: (key: keyof Layers) => void;
  cameraHeight: number | null;
  cameraBounds: BBox | null;
  setCameraState: (bounds: BBox | null, height: number | null) => void;
  earthquakesRef: RefObject<Map<string, Earthquake>>;
  flightsRef: RefObject<Map<string, Flight>>;
  citiesRef: RefObject<Map<string, WeatherCity>>;
  airQualityCitiesRef: RefObject<Map<string, WeatherCity>>;
  wildfiresRef: RefObject<Map<string, WildfireHotspot>>;
}

const GlobeUiContext = createContext<GlobeUiContextValue | null>(null);

export function GlobeUiProvider({ children }: { children: ReactNode }) {
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null);
  const [layers, setLayers] = useState<Layers>({
    earthquakes: true,
    weather: true,
    flights: true,
    airQuality: false,
    wildfires: true,
  });
  const [cameraHeight, setCameraHeight] = useState<number | null>(null);
  const [cameraBounds, setCameraBounds] = useState<BBox | null>(null);

  const earthquakesRef = useRef<Map<string, Earthquake>>(new Map());
  const flightsRef = useRef<Map<string, Flight>>(new Map());
  const citiesRef = useRef<Map<string, WeatherCity>>(new Map());
  const airQualityCitiesRef = useRef<Map<string, WeatherCity>>(new Map());
  const wildfiresRef = useRef<Map<string, WildfireHotspot>>(new Map());

  const toggleLayer = useCallback((key: keyof Layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const setCameraState = useCallback((bounds: BBox | null, height: number | null) => {
    setCameraBounds(bounds);
    setCameraHeight(height);
  }, []);

  const value = useMemo<GlobeUiContextValue>(
    () => ({
      selectedEntity,
      setSelectedEntity,
      layers,
      toggleLayer,
      cameraHeight,
      cameraBounds,
      setCameraState,
      earthquakesRef,
      flightsRef,
      citiesRef,
      airQualityCitiesRef,
      wildfiresRef,
    }),
    [selectedEntity, layers, toggleLayer, cameraHeight, cameraBounds, setCameraState]
  );

  return <GlobeUiContext.Provider value={value}>{children}</GlobeUiContext.Provider>;
}

export function useGlobeUi() {
  const ctx = useContext(GlobeUiContext);
  if (!ctx) throw new Error("useGlobeUi must be used within GlobeUiProvider");
  return ctx;
}
