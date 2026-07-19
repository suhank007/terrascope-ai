"use client";

import { useEffect } from "react";
import { Cartesian3, Color } from "cesium";
import { Entity, PointGraphics } from "resium";
import { useEarthquakes } from "../hooks/use-earthquakes";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { colorForMagnitude, pixelSizeForMagnitude } from "../lib/color-scale";

export function EarthquakeLayer() {
  const { data } = useEarthquakes();
  const { earthquakesRef } = useGlobeUi();

  useEffect(() => {
    if (!data) return;
    earthquakesRef.current = new Map(data.quakes.map((quake) => [quake.id, quake]));
  }, [data, earthquakesRef]);

  if (!data) return null;

  return (
    <>
      {data.quakes.map((quake) => (
        <Entity key={quake.id} id={quake.id} position={Cartesian3.fromDegrees(quake.longitude, quake.latitude)}>
          <PointGraphics
            pixelSize={pixelSizeForMagnitude(quake.magnitude)}
            color={colorForMagnitude(quake.magnitude)}
            outlineColor={Color.BLACK}
            outlineWidth={1}
          />
        </Entity>
      ))}
    </>
  );
}
