"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { EntityDetailView } from "./entity-detail-view";
import { ExplorerForLayer } from "./explorer-for-layer";

/** The right-hand dock: the Signal Explorer list, which swaps to the selected
 *  signal's detail (with a clear way back) instead of floating over the globe. */
export function RightDock({ className }: { className?: string }) {
  const { selectedEntity, setSelectedEntity } = useGlobeUi();

  useEffect(() => {
    if (!selectedEntity) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedEntity(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedEntity, setSelectedEntity]);

  return (
    <aside aria-label="Signal explorer" className={`dock-panel min-h-0 overflow-hidden rounded-2xl ${className ?? ""}`}>
      <AnimatePresence mode="wait" initial={false}>
        {selectedEntity ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
            className="h-full min-h-0"
          >
            <EntityDetailView selected={selectedEntity} onBack={() => setSelectedEntity(null)} />
          </motion.div>
        ) : (
          <motion.div
            key="explorer"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
            className="h-full min-h-0"
          >
            <ExplorerForLayer />
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
