import { useMemo } from "react";
import { useWildfires } from "@/features/wildfires/hooks/use-wildfires";
import { useFlights } from "@/features/flights/hooks/use-flights";
import { filterFlightsByAirlines } from "@/features/flights/lib/filter-airlines";
import { useFilteredEarthquakes } from "@/features/earthquakes/hooks/use-filtered-earthquakes";
import { WEATHER_CITIES } from "@/features/weather/lib/cities";
import { useGlobeUi, type Layers } from "@/features/globe/context/globe-ui-context";

export type LayerStat =
  | { state: "loading" }
  | { state: "error" }
  /** Loaded, but there is a reason the number isn't meaningful yet. */
  | { state: "note"; note: string }
  | { state: "ready"; count: number };

/**
 * One honest, cheap reading per layer for the Data layers panel and the
 * globe caption. Reuses the same React Query entries the map layers use, so
 * this adds no requests — it only reads.
 */
export function useLayerStats(): Record<keyof Layers, LayerStat> {
  const { layers, selectedAirlines } = useGlobeUi();
  const quakes = useFilteredEarthquakes();
  const wildfires = useWildfires();
  const flights = useFlights(layers.flights);

  return useMemo(() => {
    const flightCount = flights.data ? filterFlightsByAirlines(flights.data.flights, selectedAirlines).length : 0;

    return {
      weather: { state: "ready", count: WEATHER_CITIES.length },
      airQuality: { state: "ready", count: WEATHER_CITIES.length },
      earthquakes: quakes.isError
        ? { state: "error" }
        : quakes.quakes
          ? { state: "ready", count: quakes.quakes.length }
          : { state: "loading" },
      wildfires: wildfires.isError
        ? { state: "error" }
        : wildfires.data
          ? wildfires.data.configured
            ? { state: "ready", count: wildfires.data.count }
            : { state: "note", note: "Needs a NASA key" }
          : { state: "loading" },
      flights: !flights.isZoomedIn
        ? { state: "note", note: "Zoom in to load" }
        : flights.isError
          ? { state: "error" }
          : flights.data
            ? { state: "ready", count: flightCount }
            : { state: "loading" },
    };
  }, [
    quakes.isError,
    quakes.quakes,
    wildfires.isError,
    wildfires.data,
    flights.isZoomedIn,
    flights.isError,
    flights.data,
    selectedAirlines,
  ]);
}
