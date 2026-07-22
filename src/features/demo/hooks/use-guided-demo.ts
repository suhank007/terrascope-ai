"use client";

import { useCallback } from "react";
import { useGlobeUi, type Layers } from "@/features/globe/context/globe-ui-context";
import { useDemoMode } from "../context/demo-mode-context";
import { flyToPreset, GLOBAL_VIEW, TOKYO_VIEW } from "../lib/camera-presets";

const ALL_LAYERS_OFF: Layers = {
  earthquakes: false,
  weather: false,
  flights: false,
  airQuality: false,
  wildfires: false,
};

/** Polls in 100ms slices so a long hold can still be interrupted promptly. */
async function holdFor(ms: number, isCancelled: () => boolean) {
  let elapsed = 0;
  while (elapsed < ms) {
    if (isCancelled()) return;
    const chunk = Math.min(100, ms - elapsed);
    await new Promise((resolve) => setTimeout(resolve, chunk));
    elapsed += chunk;
  }
}

/**
 * Step 1 Show globe -> 2 Rotate Earth -> 3 Fly to Tokyo -> 4-7 enable each
 * layer -> 8 zoom out to Earth -> 9 stop. Cancellable at any await boundary
 * via the run-id in DemoModeContext, so any toolbar action or globe touch
 * (wired in DemoToolbar / GlobeViewer) interrupts cleanly mid-sequence.
 */
export function useGuidedDemo() {
  const { cesiumRef, isCameraAnimatingRef, toggleLayer, setAllLayers, setSelectedEntity } = useGlobeUi();
  const { startGuidedDemoRun, stopGuidedDemo, isRunCurrent, setGuidedRotateOverride, isGuidedDemoRunning } =
    useDemoMode();

  const start = useCallback(() => {
    const runId = startGuidedDemoRun();
    const cancelled = () => !isRunCurrent(runId);
    const flyTo = (preset: typeof GLOBAL_VIEW) =>
      new Promise<void>((resolve) => {
        const live = cesiumRef.current;
        if (!live) return resolve();
        flyToPreset(live.camera, preset, isCameraAnimatingRef, resolve);
      });

    void (async () => {
      if (!cesiumRef.current || cancelled()) return;

      setSelectedEntity(null);
      setAllLayers(ALL_LAYERS_OFF);
      setGuidedRotateOverride(false);

      // Step 1 — Show globe
      await flyTo(GLOBAL_VIEW);
      if (cancelled()) return;
      await holdFor(700, cancelled);
      if (cancelled()) return;

      // Step 2 — Rotate Earth
      setGuidedRotateOverride(true);
      await holdFor(4500, cancelled);
      if (cancelled()) return;
      setGuidedRotateOverride(false);

      // Step 3 — Fly to Tokyo
      await flyTo(TOKYO_VIEW);
      if (cancelled()) return;
      await holdFor(1200, cancelled);
      if (cancelled()) return;

      // Steps 4-7 — enable each layer with a beat to let it visibly settle
      const layerSteps: (keyof Layers)[] = ["weather", "flights", "earthquakes", "wildfires"];
      for (const key of layerSteps) {
        if (cancelled()) return;
        toggleLayer(key);
        await holdFor(2200, cancelled);
      }
      if (cancelled()) return;

      // Step 8 — Zoom out to Earth
      await flyTo(GLOBAL_VIEW);
      if (cancelled()) return;

      // Step 9 — Stop: settle into ambient rotation and end the run
      setGuidedRotateOverride(null);
      stopGuidedDemo();
    })();
  }, [
    cesiumRef,
    isCameraAnimatingRef,
    toggleLayer,
    setAllLayers,
    setSelectedEntity,
    startGuidedDemoRun,
    isRunCurrent,
    setGuidedRotateOverride,
    stopGuidedDemo,
  ]);

  return { start, stop: stopGuidedDemo, isRunning: isGuidedDemoRunning };
}
