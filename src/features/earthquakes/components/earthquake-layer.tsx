"use client";

import { useEffect } from "react";
import { Cartesian3, Color } from "cesium";
import { Entity, PointGraphics } from "resium";
import { useFilteredEarthquakes } from "../hooks/use-filtered-earthquakes";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { useFadeVisibility } from "@/features/globe/hooks/use-fade-visibility";
import { colorForMagnitude, pixelSizeForMagnitude } from "../lib/color-scale";

export function EarthquakeLayer({ active }: { active: boolean }) {
  const { data, quakes } = useFilteredEarthquakes(active);
  const { earthquakesRef } = useGlobeUi();
  const { mounted, opacity } = useFadeVisibility(active);

  useEffect(() => {
    if (!data) return;
    earthquakesRef.current = new Map(data.quakes.map((quake) => [quake.id, quake]));
  }, [data, earthquakesRef]);

  if (!mounted || !quakes) return null;

  return (
    <>
      {quakes.map((quake) => (
        <Entity key={quake.id} id={quake.id} position={Cartesian3.fromDegrees(quake.longitude, quake.latitude)}>
          <PointGraphics
            pixelSize={pixelSizeForMagnitude(quake.magnitude)}
            color={colorForMagnitude(quake.magnitude).withAlpha(opacity)}
            outlineColor={Color.BLACK.withAlpha(opacity)}
            outlineWidth={1}
          />
        </Entity>
      ))}
    </>
  );
}
