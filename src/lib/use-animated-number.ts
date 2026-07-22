"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { EASE_OUT_EXPO } from "./motion";

/**
 * Tweens a displayed number toward `value` instead of snapping to it — the
 * "12,000 → 12,450" counter-roll used by KPI stats. Always starts from
 * wherever the animation currently is, so rapid successive updates redirect
 * smoothly instead of jumping.
 */
export function useAnimatedNumber(value: number, durationMs = 600, decimals = 0): number {
  const [display, setDisplay] = useState(value);
  const displayRef = useRef(value);
  displayRef.current = display;

  useEffect(() => {
    if (displayRef.current === value) return;
    const factor = 10 ** decimals;
    const controls = animate(displayRef.current, value, {
      duration: durationMs / 1000,
      ease: EASE_OUT_EXPO,
      onUpdate: (v) => setDisplay(Math.round(v * factor) / factor),
    });
    return () => controls.stop();
  }, [value, durationMs, decimals]);

  return display;
}
