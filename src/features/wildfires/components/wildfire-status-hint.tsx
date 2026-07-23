"use client";

import { Flame, ShieldCheck } from "lucide-react";
import { useWildfires } from "../hooks/use-wildfires";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { useDemoModeOptional } from "@/features/demo/context/demo-mode-context";
import { StatusHint } from "@/features/globe/components/status-hint";

/** Covers two distinct states that used to be conflated: the feed genuinely
 *  isn't configured (setup issue) vs. it's configured and simply found
 *  nothing right now (a normal, good-news empty state). */
export function WildfireStatusHint() {
  const { layers } = useGlobeUi();
  const { data } = useWildfires();
  const demo = useDemoModeOptional();

  const active = !demo && layers.wildfires && Boolean(data);
  const notConfigured = active && data?.configured === false;
  const noActiveFires = active && data?.configured !== false && data?.hotspots.length === 0;

  if (notConfigured) {
    return (
      <StatusHint show icon={Flame} iconClassName="text-alert">
        Add a free NASA_FIRMS_MAP_KEY to enable live wildfire detections
      </StatusHint>
    );
  }

  return (
    <StatusHint show={Boolean(noActiveFires)} icon={ShieldCheck}>
      No active wildfire alerts detected right now
    </StatusHint>
  );
}
