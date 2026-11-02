"use client";

import { motion, type PanInfo } from "framer-motion";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { SPRING_PANEL } from "@/lib/motion";
import { useViewportHeight } from "../hooks/use-viewport-height";
import { EntityDetailView } from "./entity-detail-view";
import { PlaceReport } from "@/features/place/components/place-report";
import { ExplorerForLayer } from "./explorer-for-layer";
import { LayerTabs } from "./layer-tabs";
import { MapPin } from "lucide-react";

export type SheetSnap = "peek" | "half" | "full";

const PEEK_HEIGHT = 104;
/** Half is tall enough for the tabs, a header and two or three rows, while its
 *  top edge stays just below the viewport midpoint, where a signal the camera
 *  flies to lands. */
const SNAP_RATIO: Record<Exclude<SheetSnap, "peek">, number> = { half: 0.46, full: 0.88 };

const ORDER: SheetSnap[] = ["peek", "half", "full"];

export function MobileSheet({ snap, onSnapChange }: { snap: SheetSnap; onSnapChange: (snap: SheetSnap) => void }) {
  const { selectedEntity, setSelectedEntity, searchedPlace } = useGlobeUi();
  const viewportHeight = useViewportHeight();

  const height = snap === "peek" ? PEEK_HEIGHT : Math.round(viewportHeight * SNAP_RATIO[snap]);
  const step = (direction: 1 | -1) => {
    const next = ORDER[Math.min(ORDER.length - 1, Math.max(0, ORDER.indexOf(snap) + direction))];
    onSnapChange(next);
  };

  const onPanEnd = (_: PointerEvent, info: PanInfo) => {
    if (info.offset.y < -36 || info.velocity.y < -450) step(1);
    else if (info.offset.y > 36 || info.velocity.y > 450) step(-1);
  };

  const expanded = snap !== "peek";

  return (
    <motion.section
      aria-label="Signal explorer"
      initial={false}
      animate={{ height }}
      transition={SPRING_PANEL}
      className="dock-panel pointer-events-auto flex flex-col overflow-hidden rounded-t-3xl border-b-0 pb-[env(safe-area-inset-bottom)]"
    >
      <motion.div onPanEnd={onPanEnd} className="shrink-0 touch-none">
        <button
          type="button"
          onClick={() => step(snap === "full" ? -1 : 1)}
          aria-expanded={expanded}
          aria-label={snap === "full" ? "Collapse signal explorer" : "Expand signal explorer"}
          className="group flex h-8 w-full items-center justify-center"
        >
          <span className="h-1 w-10 rounded-full bg-muted/40 transition-colors group-hover:bg-muted/70" />
        </button>
        {searchedPlace ? (
          // The expanded report has its own header and tabs; the layer tabs would
          // compete with them. Collapsed, a one-line label keeps the sheet legible.
          !expanded && (
            <p className="flex h-10 items-center gap-2 px-5 pb-1 text-sm font-medium text-foreground">
              <MapPin className="h-4 w-4 text-accent" aria-hidden />
              <span className="truncate">{searchedPlace.name}</span>
              <span className="shrink-0 text-xs font-normal text-muted">Conditions</span>
            </p>
          )
        ) : (
          <LayerTabs onPick={() => snap === "peek" && onSnapChange("half")} />
        )}
      </motion.div>

      {expanded && (
        <div className="mt-2 flex min-h-0 flex-1 flex-col border-t border-border">
          {selectedEntity ? (
            <EntityDetailView selected={selectedEntity} onBack={() => setSelectedEntity(null)} />
          ) : searchedPlace ? (
            <PlaceReport place={searchedPlace} />
          ) : (
            <ExplorerForLayer />
          )}
        </div>
      )}
    </motion.section>
  );
}
