"use client";

import { useEffect, useRef } from "react";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { useDemoMode } from "../context/demo-mode-context";
import { useDemoPreload } from "../hooks/use-demo-preload";
import { flyToCinematicIntro } from "../lib/camera-presets";

const INTRO_PAUSE_MS = 2000;
const CESIUM_POLL_MS = 150;
const CESIUM_POLL_MAX_ATTEMPTS = 200; // ~30s ceiling if the globe never mounts

/**
 * Non-rendering: warms the data cache, then waits for both "preload settled
 * (or timed out)" and "the Cesium camera actually exists" before playing the
 * opening shot — pause, fly to a cinematic angle, hand off to ambient
 * rotation. Lives inside GlobeUiProvider + DemoModeProvider so it can reach
 * both without prop-drilling.
 */
export function DemoIntro() {
  const { cesiumRef, isCameraAnimatingRef } = useGlobeUi();
  const { setGuidedRotateOverride } = useDemoMode();
  const preloadReady = useDemoPreload();
  const startedRef = useRef(false);

  useEffect(() => {
    if (!preloadReady || startedRef.current) return;

    let cancelled = false;
    let pollId: ReturnType<typeof setInterval> | null = null;
    let attempts = 0;

    const playIntro = () => {
      if (startedRef.current || cancelled) return;
      startedRef.current = true;

      window.setTimeout(() => {
        if (cancelled) return;
        const live = cesiumRef.current;
        if (!live) return;
        flyToCinematicIntro(live.camera, isCameraAnimatingRef, () => {
          if (!cancelled) setGuidedRotateOverride(null); // hand off to the persisted preference
        });
      }, INTRO_PAUSE_MS);
    };

    if (cesiumRef.current) {
      playIntro();
    } else {
      pollId = setInterval(() => {
        attempts += 1;
        if (cesiumRef.current) {
          if (pollId) clearInterval(pollId);
          playIntro();
        } else if (attempts >= CESIUM_POLL_MAX_ATTEMPTS) {
          if (pollId) clearInterval(pollId);
        }
      }, CESIUM_POLL_MS);
    }

    return () => {
      cancelled = true;
      if (pollId) clearInterval(pollId);
    };
  }, [preloadReady, cesiumRef, isCameraAnimatingRef, setGuidedRotateOverride]);

  return null;
}
