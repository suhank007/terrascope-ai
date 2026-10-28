"use client";

import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Activity, Flame, Plane, PlaneTakeoff, ShieldCheck, Wind } from "lucide-react";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { useFilteredEarthquakes } from "@/features/earthquakes/hooks/use-filtered-earthquakes";
import { colorForMagnitude } from "@/features/earthquakes/lib/color-scale";
import { useWildfires } from "@/features/wildfires/hooks/use-wildfires";
import { colorForConfidence } from "@/features/wildfires/lib/color-scale";
import { useFlights } from "@/features/flights/hooks/use-flights";
import { filterFlightsByAirlines } from "@/features/flights/lib/filter-airlines";
import { useWeather } from "@/features/weather/hooks/use-weather";
import { WEATHER_CITIES } from "@/features/weather/lib/cities";
import { weatherCodeInfo } from "@/features/weather/lib/weather-code";
import { colorForTemperature } from "@/features/weather/lib/color-scale";
import { useAirQuality } from "@/features/air-quality/hooks/use-air-quality";
import { aqiHexColor, aqiLabel } from "@/features/air-quality/lib/aqi-scale";
import {
  formatAltitudeFt,
  formatCoordinate,
  formatMagnitude,
  formatRelativeTime,
  formatSpeedKt,
  formatTemperature,
} from "@/lib/format";
import { useCameraActions } from "../hooks/use-fly-to";
import { ExplorerFrame, Notice, actionClass } from "./explorer-frame";
import { SignalRow } from "./signal-row";

const PAGE_SIZE = 40;

/** Long feeds render in pages so the dock stays snappy; the globe still shows everything. */
function usePaged<T>(items: T[]) {
  const [limit, setLimit] = useState(PAGE_SIZE);
  const visible = items.slice(0, limit);
  const more =
    items.length > limit ? (
      <li className="px-5 py-4">
        <button type="button" onClick={() => setLimit((l) => l + PAGE_SIZE)} className={`${actionClass} mt-0 w-full`}>
          Show {Math.min(PAGE_SIZE, items.length - limit)} more · {items.length - limit} remaining
        </button>
      </li>
    ) : null;
  return { visible, more };
}

export function EarthquakeList() {
  const { quakes, isLoading, isError, isFetching, refetch, dataUpdatedAt } = useFilteredEarthquakes();
  const { selectedEntity, setSelectedEntity, minMagnitude, setMinMagnitude } = useGlobeUi();
  const { flyTo } = useCameraActions();

  const sorted = useMemo(
    () => (quakes ? [...quakes].sort((a, b) => +new Date(b.time) - +new Date(a.time)) : []),
    [quakes]
  );
  const { visible, more } = usePaged(sorted);
  const selectedId = selectedEntity?.type === "earthquake" ? selectedEntity.data.id : null;

  return (
    <ExplorerFrame
      layer="earthquakes"
      count={quakes?.length ?? null}
      scope="Past 24 hours"
      sortLabel="Newest first"
      status={isError ? "error" : isLoading || !quakes ? "loading" : "ready"}
      isRefreshing={isFetching}
      onRefresh={() => void refetch()}
      updatedAt={dataUpdatedAt}
      isEmpty={sorted.length === 0}
      empty={
        <Notice
          icon={ShieldCheck}
          title={minMagnitude > 0 ? `Nothing at M${minMagnitude}+` : "All quiet"}
          body={
            minMagnitude > 0
              ? "No earthquakes at this magnitude in the past 24 hours."
              : "No significant earthquakes detected in the past 24 hours."
          }
          action={
            minMagnitude > 0 ? (
              <button type="button" onClick={() => setMinMagnitude(0)} className={actionClass}>
                Show all magnitudes
              </button>
            ) : undefined
          }
        />
      }
    >
      {visible.map((quake) => (
        <SignalRow
          key={quake.id}
          icon={Activity}
          title={quake.place}
          meta={`${formatRelativeTime(quake.time)} · ${quake.depthKm.toFixed(0)} km deep${quake.tsunami ? " · tsunami advisory" : ""}`}
          badge={formatMagnitude(quake.magnitude)}
          badgeColor={colorForMagnitude(quake.magnitude).toCssColorString()}
          selected={selectedId === quake.id}
          onSelect={() => {
            flyTo(quake.longitude, quake.latitude, 2_500_000);
            setSelectedEntity({ type: "earthquake", data: quake });
          }}
        />
      ))}
      {more}
    </ExplorerFrame>
  );
}

export function WildfireList() {
  const { data, isLoading, isError, isFetching, refetch, dataUpdatedAt } = useWildfires();
  const { selectedEntity, setSelectedEntity } = useGlobeUi();
  const { flyTo } = useCameraActions();

  const hotspots = useMemo(() => (data ? [...data.hotspots].sort((a, b) => b.frp - a.frp) : []), [data]);
  const { visible, more } = usePaged(hotspots);
  const selectedId = selectedEntity?.type === "wildfire" ? selectedEntity.data.id : null;
  const notConfigured = data !== undefined && !data.configured;

  return (
    <ExplorerFrame
      layer="wildfires"
      count={data?.configured ? data.count : null}
      scope="Past 24 hours"
      sortLabel="Most intense first"
      status={isError ? "error" : isLoading || !data ? "loading" : "ready"}
      isRefreshing={isFetching}
      onRefresh={() => void refetch()}
      updatedAt={dataUpdatedAt}
      isEmpty={hotspots.length === 0}
      empty={
        <Notice
          icon={Flame}
          title={notConfigured ? "Wildfire data isn't set up" : "No active fires detected"}
          body={
            notConfigured
              ? "Add a free NASA FIRMS key as NASA_FIRMS_MAP_KEY to see satellite fire detections."
              : "NASA FIRMS hasn't reported any hotspots in the past 24 hours."
          }
        />
      }
    >
      {visible.map((fire) => (
        <SignalRow
          key={fire.id}
          icon={Flame}
          title={`${formatCoordinate(fire.latitude, "lat")}, ${formatCoordinate(fire.longitude, "lon")}`}
          meta={`${fire.confidence} confidence · ${formatRelativeTime(fire.acquiredAt)}`}
          badge={`${fire.frp.toFixed(0)} MW`}
          badgeColor={colorForConfidence(fire.confidence).toCssColorString()}
          selected={selectedId === fire.id}
          onSelect={() => {
            flyTo(fire.longitude, fire.latitude, 600_000);
            setSelectedEntity({ type: "wildfire", data: fire });
          }}
        />
      ))}
      {more}
    </ExplorerFrame>
  );
}

export function FlightList() {
  const { layers, selectedAirlines, selectedEntity, setSelectedEntity } = useGlobeUi();
  const { data, isZoomedIn, isLoading, isError, isFetching, refetch, dataUpdatedAt } = useFlights(layers.flights);
  const { flyTo, zoomToRegion } = useCameraActions();

  const flights = useMemo(
    () =>
      data
        ? filterFlightsByAirlines(data.flights, selectedAirlines).sort(
            (a, b) => (b.altitudeM ?? -1) - (a.altitudeM ?? -1)
          )
        : [],
    [data, selectedAirlines]
  );
  const { visible, more } = usePaged(flights);
  const selectedId = selectedEntity?.type === "flight" ? selectedEntity.data.icao24 : null;
  const filtered = selectedAirlines.size > 0;

  return (
    <ExplorerFrame
      layer="flights"
      count={isZoomedIn && data ? flights.length : null}
      scope="In current view"
      sortLabel="Highest first"
      status={!isZoomedIn ? "ready" : isError ? "error" : isLoading || !data ? "loading" : "ready"}
      isRefreshing={isFetching}
      onRefresh={() => void refetch()}
      updatedAt={isZoomedIn ? dataUpdatedAt : undefined}
      isEmpty={!isZoomedIn || flights.length === 0}
      empty={
        !isZoomedIn ? (
          <Notice
            icon={PlaneTakeoff}
            title="Zoom in to see live flights"
            body="Aircraft are loaded for the area you're looking at, so they only appear once you're close enough."
            action={
              <button type="button" onClick={zoomToRegion} className={actionClass}>
                Zoom into this region
              </button>
            }
          />
        ) : (
          <Notice
            icon={Plane}
            title={filtered ? "No matching aircraft here" : "No aircraft in view"}
            body={
              filtered
                ? "None of the selected airlines are flying in this area right now. Clear the filter or pan elsewhere."
                : "Try panning toward a busier region."
            }
          />
        )
      }
    >
      {visible.map((flight) => (
        <SignalRow
          key={flight.icao24}
          icon={Plane}
          title={flight.callsign ?? flight.icao24.toUpperCase()}
          meta={`${flight.aircraftType ?? "Unknown type"} · ${flight.onGround ? "On ground" : formatAltitudeFt(flight.altitudeM)}`}
          badge={formatSpeedKt(flight.velocityMs)}
          selected={selectedId === flight.icao24}
          onSelect={() => {
            flyTo(flight.longitude, flight.latitude, 400_000);
            setSelectedEntity({ type: "flight", data: flight });
          }}
        />
      ))}
      {more}
    </ExplorerFrame>
  );
}

function WeatherRow({ city }: { city: (typeof WEATHER_CITIES)[number] }) {
  const { data } = useWeather(city.lat, city.lon);
  const { selectedEntity, setSelectedEntity } = useGlobeUi();
  const { flyTo } = useCameraActions();
  const info = data ? weatherCodeInfo(data.current.weatherCode) : null;
  const selected = selectedEntity?.type === "weather-point" && selectedEntity.label === city.name;

  return (
    <SignalRow
      icon={info?.icon ?? Activity}
      title={`${city.name}, ${city.countryCode}`}
      meta={info ? info.label : "Loading…"}
      badge={data ? formatTemperature(data.current.temperatureC) : "—"}
      badgeColor={data ? colorForTemperature(data.current.temperatureC).toCssColorString() : undefined}
      selected={selected}
      onSelect={() => {
        flyTo(city.lon, city.lat, 1_800_000);
        setSelectedEntity({ type: "weather-point", lat: city.lat, lon: city.lon, label: city.name });
      }}
    />
  );
}

function AirQualityRow({ city }: { city: (typeof WEATHER_CITIES)[number] }) {
  const { data } = useAirQuality(city.lat, city.lon);
  const { selectedEntity, setSelectedEntity } = useGlobeUi();
  const { flyTo } = useCameraActions();
  const selected = selectedEntity?.type === "air-quality-point" && selectedEntity.label === city.name;

  return (
    <SignalRow
      icon={Wind}
      title={`${city.name}, ${city.countryCode}`}
      meta={data ? aqiLabel(data.current.usAqi) : "Loading…"}
      badge={data ? `AQI ${Math.round(data.current.usAqi)}` : "—"}
      badgeColor={data ? aqiHexColor(data.current.usAqi) : undefined}
      selected={selected}
      onSelect={() => {
        flyTo(city.lon, city.lat, 1_800_000);
        setSelectedEntity({ type: "air-quality-point", lat: city.lat, lon: city.lon, label: city.name });
      }}
    />
  );
}

const CITIES_BY_NAME = [...WEATHER_CITIES].sort((a, b) => a.name.localeCompare(b.name));

export function WeatherList() {
  const queryClient = useQueryClient();
  return (
    <ExplorerFrame
      layer="weather"
      count={CITIES_BY_NAME.length}
      scope="Right now"
      sortLabel="A to Z"
      status="ready"
      isRefreshing={false}
      onRefresh={() => void queryClient.invalidateQueries({ queryKey: ["weather"] })}
    >
      {CITIES_BY_NAME.map((city) => (
        <WeatherRow key={city.id} city={city} />
      ))}
    </ExplorerFrame>
  );
}

export function AirQualityList() {
  const queryClient = useQueryClient();
  return (
    <ExplorerFrame
      layer="airQuality"
      count={CITIES_BY_NAME.length}
      scope="Right now"
      sortLabel="A to Z"
      status="ready"
      isRefreshing={false}
      onRefresh={() => void queryClient.invalidateQueries({ queryKey: ["air-quality"] })}
    >
      {CITIES_BY_NAME.map((city) => (
        <AirQualityRow key={city.id} city={city} />
      ))}
    </ExplorerFrame>
  );
}
