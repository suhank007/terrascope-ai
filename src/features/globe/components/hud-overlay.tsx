"use client";

import { motion } from "framer-motion";
import { Globe2 } from "lucide-react";
import { KpiTicker } from "@/features/kpi-bar/components/kpi-ticker";
import { FlightZoomHint } from "@/features/flights/components/flight-zoom-hint";
import { AirlineFilter } from "@/features/flights/components/airline-filter";
import { WildfireConfigHint } from "@/features/wildfires/components/wildfire-config-hint";
import { AlertsBell } from "@/features/alerts/components/alerts-bell";
import { CopilotLauncher } from "@/features/copilot/components/copilot-launcher";
import { LayerToggle } from "./layer-toggle";
import { useGlobeUi } from "../context/globe-ui-context";

export function HudOverlay() {
  const { layers } = useGlobeUi();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6"
      >
        <div className="glass-panel pointer-events-auto flex items-center gap-2 self-start rounded-full py-2 pl-3 pr-4">
          <Globe2 className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold tracking-tight text-foreground">TerraScope AI</span>
        </div>

        <div className="pointer-events-auto flex flex-wrap items-center gap-2">
          <KpiTicker />
          <LayerToggle />
          {layers.flights && <AirlineFilter />}
          <AlertsBell />
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-20 flex flex-col items-center gap-2">
        <FlightZoomHint />
        <WildfireConfigHint />
      </div>

      <div className="pointer-events-none absolute bottom-6 right-6 z-20">
        <CopilotLauncher />
      </div>
    </>
  );
}
