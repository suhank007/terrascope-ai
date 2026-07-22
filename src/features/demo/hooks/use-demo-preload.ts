"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchEarthquakes } from "@/features/earthquakes/api";
import { fetchWildfires } from "@/features/wildfires/api";
import { fetchWeather } from "@/features/weather/api";
import { fetchAirQuality } from "@/features/air-quality/api";
import { WEATHER_CITIES } from "@/features/weather/lib/cities";

/** Never let a slow network hold the intro hostage — proceed regardless past this point. */
const PRELOAD_TIMEOUT_MS = 6000;

/** Must match the rounding in use-weather.ts / use-air-quality.ts exactly, or the
 *  prefetched cache entry sits under a different key than the one those hooks read. */
function roundCoord(value: number) {
  return Math.round(value * 100) / 100;
}

/**
 * Warms the query cache for every global/no-zoom-required data source before
 * the demo intro plays, so toggling a layer during a recording never shows a
 * loading spinner. Flights are intentionally excluded — the flights API is
 * viewport-scoped (see useFlights), there's no "all flights" endpoint to
 * preload, and the guided demo doesn't enable flights until after it has
 * already flown to Tokyo, at which point the real viewport-based fetch fires.
 */
export function useDemoPreload(): boolean {
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const jobs: Promise<unknown>[] = [
      queryClient.prefetchQuery({ queryKey: ["earthquakes"], queryFn: fetchEarthquakes }),
      queryClient.prefetchQuery({ queryKey: ["wildfires"], queryFn: fetchWildfires }),
      ...WEATHER_CITIES.flatMap((city) => {
        const lat = roundCoord(city.lat);
        const lon = roundCoord(city.lon);
        return [
          queryClient.prefetchQuery({ queryKey: ["weather", lat, lon], queryFn: () => fetchWeather(lat, lon) }),
          queryClient.prefetchQuery({
            queryKey: ["air-quality", lat, lon],
            queryFn: () => fetchAirQuality(lat, lon),
          }),
        ];
      }),
    ];

    const timeout = new Promise<void>((resolve) => setTimeout(resolve, PRELOAD_TIMEOUT_MS));

    Promise.race([Promise.allSettled(jobs), timeout]).finally(() => setReady(true));
  }, [queryClient]);

  return ready;
}
