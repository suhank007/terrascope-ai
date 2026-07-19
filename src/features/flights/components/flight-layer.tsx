"use client";

import { useEffect } from "react";
import { Cartesian3, Math as CesiumMath } from "cesium";
import { Entity, BillboardGraphics } from "resium";
import { useFlights } from "../hooks/use-flights";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { colorForAltitude } from "../lib/color-scale";

export function FlightLayer() {
  const { data } = useFlights();
  const { flightsRef } = useGlobeUi();

  useEffect(() => {
    if (!data) return;
    flightsRef.current = new Map(data.flights.map((flight) => [flight.icao24, flight]));
  }, [data, flightsRef]);

  if (!data) return null;

  return (
    <>
      {data.flights.map((flight) => (
        <Entity
          key={flight.icao24}
          id={flight.icao24}
          position={Cartesian3.fromDegrees(flight.longitude, flight.latitude, flight.altitudeM ?? 0)}
        >
          <BillboardGraphics
            image="/icons/aircraft.svg"
            scale={0.45}
            color={colorForAltitude(flight.altitudeM, flight.onGround)}
            rotation={CesiumMath.toRadians(-(flight.trueTrack ?? 0))}
            alignedAxis={Cartesian3.UNIT_Z}
          />
        </Entity>
      ))}
    </>
  );
}
