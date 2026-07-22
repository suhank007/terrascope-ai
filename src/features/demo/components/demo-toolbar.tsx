"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Crosshair,
  Eye,
  EyeOff,
  Maximize,
  MapPin,
  Minimize,
  Play,
  RefreshCw,
  RotateCcw,
  Square,
} from "lucide-react";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { useDemoMode } from "../context/demo-mode-context";
import { useGuidedDemo } from "../hooks/use-guided-demo";
import { CAMERA_PRESETS, GLOBAL_VIEW, flyToPreset, type CameraPreset } from "../lib/camera-presets";
import { EASE_OUT_EXPO, STAGGER_LIST } from "@/lib/motion";
import { cn } from "@/lib/utils";

function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void document.documentElement.requestFullscreen();
    }
  };

  return { isFullscreen, toggle };
}

const ICON_BTN =
  "flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground active:scale-90";

export function DemoToolbar() {
  const { cesiumRef, isCameraAnimatingRef, setAllLayers, setSelectedEntity } = useGlobeUi();
  const demo = useDemoMode();
  const guidedDemo = useGuidedDemo();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const [presetsOpen, setPresetsOpen] = useState(false);
  const presetsRef = useRef<HTMLDivElement>(null);

  const effectiveAutoRotate = demo.guidedRotateOverride ?? demo.autoRotate;

  useEffect(() => {
    if (!presetsOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) setPresetsOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [presetsOpen]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA"].includes(target.tagName)) return;

      if (e.key === "h" || e.key === "H") {
        if (demo.uiHidden) demo.setUiHidden(false);
        else hideUi();
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "Escape" && demo.uiHidden) {
        demo.setUiHidden(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo.uiHidden]);

  function interruptGuidedDemo() {
    if (demo.isGuidedDemoRunning) demo.stopGuidedDemo();
  }

  function hideUi() {
    setSelectedEntity(null);
    demo.setUiHidden(true);
  }

  function handleResetCamera() {
    interruptGuidedDemo();
    const live = cesiumRef.current;
    if (live) flyToPreset(live.camera, GLOBAL_VIEW, isCameraAnimatingRef);
  }

  function handlePreset(preset: CameraPreset) {
    interruptGuidedDemo();
    const live = cesiumRef.current;
    if (live) flyToPreset(live.camera, preset, isCameraAnimatingRef);
    setPresetsOpen(false);
  }

  function handleRestart() {
    interruptGuidedDemo();
    setSelectedEntity(null);
    setAllLayers({ earthquakes: false, weather: false, flights: false, airQuality: false, wildfires: false });
    demo.setUiHidden(false);
    const live = cesiumRef.current;
    if (live) flyToPreset(live.camera, GLOBAL_VIEW, isCameraAnimatingRef);
  }

  function handleToggleGuidedDemo() {
    if (demo.isGuidedDemoRunning) demo.stopGuidedDemo();
    else guidedDemo.start();
  }

  if (demo.uiHidden) {
    return (
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.35 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        onClick={() => demo.setUiHidden(false)}
        aria-label="Show demo UI"
        title="Show demo UI (H)"
        className="pointer-events-auto absolute right-4 top-1/2 z-40 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface-elevated text-muted active:scale-90"
      >
        <Eye className="h-4 w-4" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
      className="glass-panel pointer-events-auto absolute right-4 top-1/2 z-40 flex -translate-y-1/2 flex-col items-center gap-1 rounded-full p-2"
    >
      <button
        onClick={handleToggleGuidedDemo}
        aria-pressed={demo.isGuidedDemoRunning}
        title={demo.isGuidedDemoRunning ? "Stop guided demo" : "Start guided demo"}
        className={cn(
          "flex flex-col items-center gap-0.5 rounded-full px-2 py-2 text-[10px] font-medium transition-colors active:scale-95",
          demo.isGuidedDemoRunning ? "text-danger" : "text-accent"
        )}
      >
        {demo.isGuidedDemoRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        {demo.isGuidedDemoRunning ? "Stop" : "Demo"}
      </button>

      <div className="my-0.5 h-px w-6 bg-border" />

      <div ref={presetsRef} className="relative">
        <button
          onClick={() => setPresetsOpen((o) => !o)}
          aria-expanded={presetsOpen}
          aria-label="Camera presets"
          title="Camera presets"
          className={cn(ICON_BTN, presetsOpen && "text-accent")}
        >
          <MapPin className="h-4 w-4" />
        </button>
        <AnimatePresence>
          {presetsOpen && (
            <motion.div
              initial={{ opacity: 0, x: 8, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.97 }}
              transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
              className="glass-panel-elevated absolute right-11 top-1/2 z-30 w-44 -translate-y-1/2 rounded-2xl p-2 shadow-2xl"
            >
              <motion.ul
                initial="hidden"
                animate="visible"
                variants={STAGGER_LIST.container}
                className="flex flex-col gap-0.5"
              >
                {CAMERA_PRESETS.map((preset) => (
                  <motion.li key={preset.id} variants={STAGGER_LIST.item}>
                    <button
                      onClick={() => handlePreset(preset)}
                      className="w-full rounded-lg px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-surface-elevated active:scale-[0.99]"
                    >
                      {preset.label}
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button onClick={handleResetCamera} aria-label="Reset camera" title="Reset camera" className={ICON_BTN}>
        <Crosshair className="h-4 w-4" />
      </button>

      <button
        onClick={() => {
          interruptGuidedDemo();
          demo.setAutoRotate(!effectiveAutoRotate);
        }}
        aria-pressed={effectiveAutoRotate}
        aria-label={effectiveAutoRotate ? "Turn off auto rotate" : "Turn on auto rotate"}
        title="Auto rotate"
        className={cn(ICON_BTN, effectiveAutoRotate && "text-accent")}
      >
        <RefreshCw className="h-4 w-4" />
      </button>

      <button onClick={hideUi} aria-label="Hide UI" title="Hide UI (H)" className={ICON_BTN}>
        <EyeOff className="h-4 w-4" />
      </button>

      <button
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
        title="Full screen (F)"
        className={ICON_BTN}
      >
        {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
      </button>

      <button onClick={handleRestart} aria-label="Restart demo" title="Restart demo" className={ICON_BTN}>
        <RotateCcw className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
