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
import type { Camera, Scene } from "cesium";
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
  setAllLayers: (layers: Layers) => void;
  cameraHeight: number | null;
  cameraBounds: BBox | null;
  setCameraState: (bounds: BBox | null, height: number | null) => void;
  earthquakesRef: RefObject<Map<string, Earthquake>>;
  flightsRef: RefObject<Map<string, Flight>>;
  citiesRef: RefObject<Map<string, WeatherCity>>;
  airQualityCitiesRef: RefObject<Map<string, WeatherCity>>;
  wildfiresRef: RefObject<Map<string, WildfireHotspot>>;
  selectedAirlines: ReadonlySet<string>;
  toggleAirline: (icaoPrefix: string) => void;
  clearAirlineFilter: () => void;
  setAirlineFilter: (icaoPrefixes: ReadonlySet<string>) => void;
  /** Live Cesium camera/scene handles, populated from inside the Viewer tree
   *  so HUD components outside it (e.g. "Save current view") can read/set
   *  the camera imperatively without themselves living inside <Viewer>. */
  cesiumRef: RefObject<{ camera: Camera; scene: Scene } | null>;
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
  const [selectedAirlines, setSelectedAirlines] = useState<ReadonlySet<string>>(() => new Set());

  const earthquakesRef = useRef<Map<string, Earthquake>>(new Map());
  const flightsRef = useRef<Map<string, Flight>>(new Map());
  const citiesRef = useRef<Map<string, WeatherCity>>(new Map());
  const airQualityCitiesRef = useRef<Map<string, WeatherCity>>(new Map());
  const wildfiresRef = useRef<Map<string, WildfireHotspot>>(new Map());
  const cesiumRef = useRef<{ camera: Camera; scene: Scene } | null>(null);

  const toggleLayer = useCallback((key: keyof Layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const setAllLayers = useCallback((next: Layers) => {
    setLayers(next);
  }, []);

  const setCameraState = useCallback((bounds: BBox | null, height: number | null) => {
    setCameraBounds(bounds);
    setCameraHeight(height);
  }, []);

  const toggleAirline = useCallback((icaoPrefix: string) => {
    setSelectedAirlines((prev) => {
      const next = new Set(prev);
      if (next.has(icaoPrefix)) next.delete(icaoPrefix);
      else next.add(icaoPrefix);
      return next;
    });
  }, []);

  const clearAirlineFilter = useCallback(() => {
    setSelectedAirlines(new Set());
  }, []);

  const setAirlineFilter = useCallback((icaoPrefixes: ReadonlySet<string>) => {
    setSelectedAirlines(new Set(icaoPrefixes));
  }, []);

  const value = useMemo<GlobeUiContextValue>(
    () => ({
      selectedEntity,
      setSelectedEntity,
      layers,
      toggleLayer,
      setAllLayers,
      cameraHeight,
      cameraBounds,
      setCameraState,
      earthquakesRef,
      flightsRef,
      citiesRef,
      airQualityCitiesRef,
      wildfiresRef,
      selectedAirlines,
      toggleAirline,
      clearAirlineFilter,
      setAirlineFilter,
      cesiumRef,
    }),
    [
      selectedEntity,
      layers,
      toggleLayer,
      setAllLayers,
      cameraHeight,
      cameraBounds,
      setCameraState,
      selectedAirlines,
      toggleAirline,
      clearAirlineFilter,
      setAirlineFilter,
    ]
  );

  return <GlobeUiContext.Provider value={value}>{children}</GlobeUiContext.Provider>;
}

export function useGlobeUi() {
  const ctx = useContext(GlobeUiContext);
  if (!ctx) throw new Error("useGlobeUi must be used within GlobeUiProvider");
  return ctx;
}
