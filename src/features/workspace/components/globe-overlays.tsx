"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Cartesian3 } from "cesium";
import { Crosshair, Minus, Play, Plus } from "lucide-react";
import { CopilotLauncher } from "@/features/copilot/components/copilot-launcher";
import { FlightZoomHint } from "@/features/flights/components/flight-zoom-hint";
import { WildfireStatusHint } from "@/features/wildfires/components/wildfire-status-hint";
import { EarthquakeStatusHint } from "@/features/earthquakes/components/earthquake-status-hint";
import { MapLegend } from "@/features/globe/components/map-legend";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { CLOSE_ZOOM_HEIGHT_THRESHOLD } from "@/features/globe/lib/cesium-config";
import { useAnimatedNumber } from "@/lib/use-animated-number";
import { HOME_VIEW, useCameraActions } from "../hooks/use-fly-to";
import { useCameraReadout } from "../hooks/use-camera-readout";
import { useLayerStats } from "../hooks/use-layer-stats";
import { LAYER_ORDER } from "../lib/layer-meta";

function formatAxis(value: number, positive: string, negative: string) {
  return `${Math.abs(value).toFixed(1)}° ${value >= 0 ? positive : negative}`;
}

const controlClass =
  "flex h-10 w-10 items-center justify-center text-foreground/75 transition-colors hover:bg-foreground/10 hover:text-foreground active:scale-90";

/** Everything that floats over the globe in the docked layout: caption, zoom
 *  controls, legend, coordinates, transient hints and the Ask AI button. */
export function GlobeOverlays() {
  const { layers, cameraHeight, cesiumRef } = useGlobeUi();
  const stats = useLayerStats();
  const readout = useCameraReadout();
  const { zoomBy, resetView } = useCameraActions();

  // One-time framing when the docked layout mounts. The camera is only moved
  // while it is still at Cesium's default distance, so a user (or a saved
  // view) that already moved it is never yanked back.
  useEffect(() => {
    if (!window.matchMedia("(min-width: 1280px)").matches) return;
    let tries = 0;
    const id = setInterval(() => {
      const live = cesiumRef.current;
      if (!live && ++tries < 40) return;
      clearInterval(id);
      if (live && live.camera.positionCartographic.height > 12_000_000) {
        live.camera.setView({
          destination: Cartesian3.fromDegrees(HOME_VIEW.longitude, HOME_VIEW.latitude, HOME_VIEW.height),
        });
      }
    }, 100);
    return () => clearInterval(id);
  }, [cesiumRef]);

  const total = LAYER_ORDER.reduce((sum, key) => {
    const stat = stats[key];
    return layers[key] && stat.state === "ready" ? sum + stat.count : sum;
  }, 0);
  const animatedTotal = useAnimatedNumber(total);
  const regional = cameraHeight !== null && cameraHeight < CLOSE_ZOOM_HEIGHT_THRESHOLD;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 hidden xl:block">
      <div className="glass-panel-elevated absolute left-5 top-5 rounded-xl px-4 py-3">
        <p className="flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Earth observation
        </p>
        <h2 className="mt-3 text-lg font-medium tracking-tight text-foreground">
          {regional ? "A closer look" : "A global perspective"}
        </h2>
        <p className="mt-1 text-sm tabular-nums text-muted">
          {Math.round(animatedTotal).toLocaleString()} visible signals
        </p>
      </div>

      <div className="pointer-events-auto absolute right-5 top-5 flex flex-col divide-y divide-border overflow-hidden rounded-xl glass-panel-elevated">
        <button type="button" onClick={() => zoomBy(0.4)} aria-label="Zoom in" title="Zoom in" className={controlClass}>
          <Plus className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => zoomBy(-0.6)} aria-label="Zoom out" title="Zoom out" className={controlClass}>
          <Minus className="h-4 w-4" />
        </button>
        <button type="button" onClick={resetView} aria-label="Reset view" title="Reset view" className={controlClass}>
          <Crosshair className="h-4 w-4" />
        </button>
        <Link href="/demo" aria-label="Start guided tour" title="Guided tour" className={controlClass}>
          <Play className="h-4 w-4" />
        </Link>
      </div>

      <div className="pointer-events-auto absolute bottom-12 left-5">
        <MapLegend />
      </div>

      <div className="absolute inset-x-0 bottom-5 flex flex-col items-center gap-2">
        <FlightZoomHint />
        <WildfireStatusHint />
        <EarthquakeStatusHint />
        <p className="glass-panel-elevated flex items-center gap-3 rounded-full px-4 py-1.5 text-xs">
          <span className="font-mono tabular-nums text-foreground">
            {readout ? `${formatAxis(readout.latitude, "N", "S")}  |  ${formatAxis(readout.longitude, "E", "W")}` : "—"}
          </span>
          <span className="hidden h-3 w-px bg-border 2xl:block" />
          <span className="hidden text-muted 2xl:block">Drag to orbit · Scroll or pinch to zoom</span>
        </p>
      </div>

      <div className="pointer-events-auto absolute bottom-5 right-5">
        <CopilotLauncher />
      </div>
    </div>
  );
}
