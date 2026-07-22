"use client";

import { useEffect } from "react";
import { Cartesian3, Color } from "cesium";
import { Entity, PointGraphics } from "resium";
import { useWildfires } from "../hooks/use-wildfires";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { useFadeVisibility } from "@/features/globe/hooks/use-fade-visibility";
import { colorForConfidence, pixelSizeForFrp } from "../lib/color-scale";

export function WildfireLayer({ active }: { active: boolean }) {
  const { data } = useWildfires(active);
  const { wildfiresRef } = useGlobeUi();
  const { mounted, opacity } = useFadeVisibility(active);

  useEffect(() => {
    if (!data) return;
    wildfiresRef.current = new Map(data.hotspots.map((hotspot) => [hotspot.id, hotspot]));
  }, [data, wildfiresRef]);

  if (!mounted || !data || data.hotspots.length === 0) return null;

  return (
    <>
      {data.hotspots.map((hotspot) => (
        <Entity
          key={hotspot.id}
          id={hotspot.id}
          position={Cartesian3.fromDegrees(hotspot.longitude, hotspot.latitude)}
        >
          <PointGraphics
            pixelSize={pixelSizeForFrp(hotspot.frp)}
            color={colorForConfidence(hotspot.confidence).withAlpha(opacity)}
            outlineColor={Color.BLACK.withAlpha(opacity)}
            outlineWidth={1}
          />
        </Entity>
      ))}
    </>
  );
}
