"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { EASE_OUT_EXPO } from "@/lib/motion";

/**
 * Keeps a Cesium layer mounted for `durationMs` past the moment it's turned
 * off so it can fade its entities out, instead of popping the whole layer
 * out of existence on the frame the toggle fires. Cesium entities aren't DOM
 * nodes, so AnimatePresence can't do this for us — this is the manual
 * equivalent, driven by a single shared opacity per layer (not per entity,
 * which would mean hundreds of independent tweens on a busy flights layer).
 */
export function useFadeVisibility(active: boolean, durationMs = 450) {
  const [mounted, setMounted] = useState(active);
  const [opacity, setOpacity] = useState(active ? 1 : 0);
  const opacityRef = useRef(opacity);
  opacityRef.current = opacity;

  useEffect(() => {
    if (active) setMounted(true);

    const controls = animate(opacityRef.current, active ? 1 : 0, {
      duration: durationMs / 1000,
      ease: EASE_OUT_EXPO,
      onUpdate: setOpacity,
      onComplete: () => {
        if (!active) setMounted(false);
      },
    });

    return () => controls.stop();
  }, [active, durationMs]);

  return { mounted, opacity };
}
