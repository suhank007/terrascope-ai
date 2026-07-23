"use client";

import { useEffect, useRef } from "react";
import { useCesium } from "resium";
import { Cartesian3 } from "cesium";
import { useGlobeUi } from "../context/globe-ui-context";

const INITIAL_DELAY_MS = 1500;
const RESUME_DELAY_MS = 4000;
/** One full revolution every 4 minutes — present, never distracting. */
const RADIANS_PER_MS = (2 * Math.PI) / (240 * 1000);

interface GlobeAutoRotateProps {
  /** Omit for the default ambient behavior: idle timer, auto-resumes a few
   *  seconds after the user lets go. Pass a boolean to drive rotation
   *  directly instead — e.g. demo mode's toolbar toggle, where resuming
   *  should be an explicit choice, not a timer, and should happen the
   *  instant the presenter releases the globe rather than after a delay. */
  enabled?: boolean;
  onInteract?: () => void;
}

export function GlobeAutoRotate({ enabled, onInteract }: GlobeAutoRotateProps = {}) {
  const { viewer, scene, camera } = useCesium();
  const { isCameraAnimatingRef } = useGlobeUi();
  const resumeAtRef = useRef(0);
  const pointerDownRef = useRef(false);
  const enabledRef = useRef(enabled);
  const onInteractRef = useRef(onInteract);

  useEffect(() => {
    enabledRef.current = enabled;
    onInteractRef.current = onInteract;
  }, [enabled, onInteract]);

  useEffect(() => {
    if (!viewer || !scene || !camera) return;
    resumeAtRef.current = Date.now() + INITIAL_DELAY_MS;
    const canvas = viewer.canvas;

    const markInteraction = () => {
      resumeAtRef.current = Date.now() + RESUME_DELAY_MS;
    };
    const onPointerDown = () => {
      pointerDownRef.current = true;
      markInteraction();
      onInteractRef.current?.();
    };
    const onPointerUp = () => {
      pointerDownRef.current = false;
      markInteraction();
    };
    const onWheel = () => {
      markInteraction();
      onInteractRef.current?.();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: true });

    let lastFrameTime = performance.now();
    let wasAnimating = false;
    const onPostRender = () => {
      const now = performance.now();
      const dt = now - lastFrameTime;
      lastFrameTime = now;

      if (isCameraAnimatingRef.current) {
        wasAnimating = true;
        return;
      }
      if (wasAnimating) {
        // A programmatic flyTo (search, saved view) just finished. This is
        // a deliberate "go here" from the user, not idle browsing — ambient
        // rotation should not drift the camera away from it on any timer.
        // Only suspend, don't just delay: only a real touch on the canvas
        // (markInteraction, below) is allowed to re-arm the idle resume.
        wasAnimating = false;
        resumeAtRef.current = Infinity;
      }

      if (pointerDownRef.current) return;
      if (document.hidden) return;

      const isControlled = enabledRef.current !== undefined;
      if (isControlled) {
        if (!enabledRef.current) return;
      } else if (Date.now() < resumeAtRef.current) {
        return;
      }

      camera.rotate(Cartesian3.UNIT_Z, -RADIANS_PER_MS * dt);
    };

    scene.postRender.addEventListener(onPostRender);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", onWheel);
      scene.postRender.removeEventListener(onPostRender);
    };
  }, [viewer, scene, camera, isCameraAnimatingRef]);

  return null;
}
