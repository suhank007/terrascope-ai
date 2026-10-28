"use client";

import { useState } from "react";
import { Crosshair } from "lucide-react";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { CopilotLauncher } from "@/features/copilot/components/copilot-launcher";
import { FlightZoomHint } from "@/features/flights/components/flight-zoom-hint";
import { EarthquakeStatusHint } from "@/features/earthquakes/components/earthquake-status-hint";
import { MapLegend } from "@/features/globe/components/map-legend";
import { useCameraActions } from "../hooks/use-fly-to";
import { MobileSheet, type SheetSnap } from "./mobile-sheet";
import { MobileTopBar } from "./mobile-top-bar";

/**
 * Everything over the globe below `xl`: a compact top bar and a bottom stack
 * (transient hints, legend/reset + Ask AI, then the Signal Explorer sheet).
 * The stack is one flex column, so hints and buttons ride up with the sheet
 * instead of colliding with it; they step aside as the sheet takes the screen.
 */
export function MobileChrome({ className }: { className?: string }) {
  const [snap, setSnap] = useState<SheetSnap>("peek");
  const { resetView } = useCameraActions();
  const { selectedEntity } = useGlobeUi();

  // A selection (from the list or a tap on the globe) lifts a collapsed sheet
  // to half so its detail is visible. Adjusting state during render is the
  // sanctioned way to react to a context change without an effect.
  const [prevSelected, setPrevSelected] = useState(selectedEntity);
  if (selectedEntity !== prevSelected) {
    setPrevSelected(selectedEntity);
    if (selectedEntity && snap === "peek") setSnap("half");
  }

  return (
    <div className={className}>
      <MobileTopBar hidden={snap === "full"} />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col">
        {snap === "peek" && (
          <div className="flex flex-col items-center gap-2 px-3 pb-3">
            <FlightZoomHint />
            <EarthquakeStatusHint />
          </div>
        )}

        {snap !== "full" && (
          <div className="flex items-end justify-between gap-2 px-3 pb-3">
            <div className="pointer-events-auto flex items-center gap-2">
              <MapLegend />
              <button
                type="button"
                onClick={resetView}
                aria-label="Reset view"
                title="Reset view"
                className="glass-panel-elevated flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground active:scale-90"
              >
                <Crosshair className="h-4 w-4" />
              </button>
            </div>
            <div className="pointer-events-auto">
              <CopilotLauncher />
            </div>
          </div>
        )}

        <MobileSheet snap={snap} onSnapChange={setSnap} />
      </div>
    </div>
  );
}
