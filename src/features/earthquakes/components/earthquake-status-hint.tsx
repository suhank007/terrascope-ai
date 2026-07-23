"use client";

import { ShieldCheck } from "lucide-react";
import { useEarthquakes } from "../hooks/use-earthquakes";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { useDemoModeOptional } from "@/features/demo/context/demo-mode-context";
import { StatusHint } from "@/features/globe/components/status-hint";

export function EarthquakeStatusHint() {
  const { layers } = useGlobeUi();
  const { data } = useEarthquakes();
  const demo = useDemoModeOptional();

  const show = !demo && layers.earthquakes && Boolean(data) && data?.quakes.length === 0;

  return (
    <StatusHint show={Boolean(show)} icon={ShieldCheck}>
      No significant earthquakes detected in the last 24 hours
    </StatusHint>
  );
}
