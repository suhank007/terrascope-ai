"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PlaneTakeoff } from "lucide-react";
import { useFlights } from "../hooks/use-flights";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { useDemoModeOptional } from "@/features/demo/context/demo-mode-context";

export function FlightZoomHint() {
  const { layers } = useGlobeUi();
  const { isZoomedIn } = useFlights();
  const demo = useDemoModeOptional();

  // Recording-friendly: transient hints never appear during a demo capture.
  const show = !demo && layers.flights && !isZoomedIn;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="glass-panel pointer-events-none flex items-center gap-2 rounded-full px-4 py-2 text-xs text-muted"
        >
          <PlaneTakeoff className="h-3.5 w-3.5 text-accent" />
          Zoom in to see live flights
        </motion.div>
      )}
    </AnimatePresence>
  );
}
