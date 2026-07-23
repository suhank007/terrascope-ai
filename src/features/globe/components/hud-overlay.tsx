"use client";

import { motion } from "framer-motion";
import { KpiTicker } from "@/features/kpi-bar/components/kpi-ticker";
import { FlightZoomHint } from "@/features/flights/components/flight-zoom-hint";
import { AirlineFilter } from "@/features/flights/components/airline-filter";
import { WildfireStatusHint } from "@/features/wildfires/components/wildfire-status-hint";
import { EarthquakeStatusHint } from "@/features/earthquakes/components/earthquake-status-hint";
import { AlertsBell } from "@/features/alerts/components/alerts-bell";
import { CopilotLauncher } from "@/features/copilot/components/copilot-launcher";
import { AccountLauncher } from "@/features/auth/components/account-launcher";
import { SearchBar } from "@/features/search/components/search-bar";
import { LayerToggle } from "./layer-toggle";
import { MapLegend } from "./map-legend";
import { BrandMark } from "./brand-mark";
import { useGlobeUi } from "../context/globe-ui-context";
import { useDemoModeOptional } from "@/features/demo/context/demo-mode-context";
import { EASE_OUT_EXPO } from "@/lib/motion";

export function HudOverlay() {
  const { layers } = useGlobeUi();
  const demo = useDemoModeOptional();

  if (demo?.uiHidden) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
        className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-3 p-4 sm:p-6"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="pointer-events-auto flex flex-wrap items-center gap-2 self-start">
            <BrandMark />
            {layers.flights && <AirlineFilter />}
          </div>

          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            <KpiTicker />
            <LayerToggle />
            <AlertsBell />
            {!demo && <AccountLauncher />}
          </div>
        </div>

        <div className="pointer-events-auto flex justify-center">
          <SearchBar />
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-2">
        <FlightZoomHint />
        <WildfireStatusHint />
        <EarthquakeStatusHint />
      </div>

      <div className="pointer-events-auto absolute bottom-6 left-6 z-20">
        <MapLegend />
      </div>

      <div className="pointer-events-auto absolute bottom-6 right-6 z-20">
        <CopilotLauncher />
      </div>
    </>
  );
}
