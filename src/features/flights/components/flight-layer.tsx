"use client";

import { useEffect, useMemo } from "react";
import { Cartesian3, Math as CesiumMath } from "cesium";
import { Entity, BillboardGraphics } from "resium";
import { useFlights } from "../hooks/use-flights";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { useFadeVisibility } from "@/features/globe/hooks/use-fade-visibility";
import { colorForAltitude } from "../lib/color-scale";
import { filterFlightsByAirlines } from "../lib/filter-airlines";

export function FlightLayer({ active }: { active: boolean }) {
  const { data } = useFlights(active);
  const { flightsRef, selectedAirlines } = useGlobeUi();
  const { mounted, opacity } = useFadeVisibility(active);

  const flights = useMemo(
    () => (data ? filterFlightsByAirlines(data.flights, selectedAirlines) : []),
    [data, selectedAirlines]
  );

  useEffect(() => {
    flightsRef.current = new Map(flights.map((flight) => [flight.icao24, flight]));
  }, [flights, flightsRef]);

  if (!mounted || !data) return null;

  return (
    <>
      {flights.map((flight) => (
        <Entity
          key={flight.icao24}
          id={flight.icao24}
          position={Cartesian3.fromDegrees(flight.longitude, flight.latitude, flight.altitudeM ?? 0)}
        >
          <BillboardGraphics
            image="/icons/aircraft.svg"
            scale={0.45}
            color={colorForAltitude(flight.altitudeM, flight.onGround).withAlpha(opacity)}
            rotation={CesiumMath.toRadians(-(flight.trueTrack ?? 0))}
            alignedAxis={Cartesian3.UNIT_Z}
          />
        </Entity>
      ))}
    </>
  );
}
