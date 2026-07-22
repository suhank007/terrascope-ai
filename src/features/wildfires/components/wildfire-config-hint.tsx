"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useWildfires } from "../hooks/use-wildfires";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { useDemoModeOptional } from "@/features/demo/context/demo-mode-context";

export function WildfireConfigHint() {
  const { layers } = useGlobeUi();
  const { data } = useWildfires();
  const demo = useDemoModeOptional();

  // Never surface setup/config instructions during a recorded demo.
  const show = !demo && layers.wildfires && data?.configured === false;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="glass-panel pointer-events-none flex items-center gap-2 rounded-full px-4 py-2 text-xs text-muted"
        >
          <Flame className="h-3.5 w-3.5 text-alert" />
          Add a free NASA_FIRMS_MAP_KEY to enable live wildfire detections
        </motion.div>
      )}
    </AnimatePresence>
  );
}
