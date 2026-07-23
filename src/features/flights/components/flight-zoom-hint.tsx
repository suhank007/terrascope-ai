"use client";

import { PlaneTakeoff } from "lucide-react";
import { useFlights } from "../hooks/use-flights";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { useDemoModeOptional } from "@/features/demo/context/demo-mode-context";
import { StatusHint } from "@/features/globe/components/status-hint";

export function FlightZoomHint() {
  const { layers } = useGlobeUi();
  const { isZoomedIn } = useFlights();
  const demo = useDemoModeOptional();

  // Recording-friendly: transient hints never appear during a demo capture.
  const show = !demo && layers.flights && !isZoomedIn;

  return (
    <StatusHint show={show} icon={PlaneTakeoff}>
      Zoom in to see live flights
    </StatusHint>
  );
}
