"use client";

import { useEffect, useRef } from "react";
import { useCesium } from "resium";
import { Cartesian3 } from "cesium";
import { useGlobeUi } from "../context/globe-ui-context";

/** One full revolution every 4 minutes — present, never distracting. */
const RADIANS_PER_MS = (2 * Math.PI) / (240 * 1000);

interface GlobeAutoRotateProps {
  /** Rotation runs only while this is explicitly true. No idle timer, no
   *  ambient default, no auto-resume — purely controlled, e.g. by demo
   *  mode's toolbar toggle or its guided-demo script. */
  enabled: boolean;
  onInteract?: () => void;
}

export function GlobeAutoRotate({ enabled, onInteract }: GlobeAutoRotateProps) {
  const { viewer, scene, camera } = useCesium();
  const { isCameraAnimatingRef } = useGlobeUi();
  const pointerDownRef = useRef(false);
  const enabledRef = useRef(enabled);
  const onInteractRef = useRef(onInteract);

  useEffect(() => {
    enabledRef.current = enabled;
    onInteractRef.current = onInteract;
  }, [enabled, onInteract]);

  useEffect(() => {
    if (!viewer || !scene || !camera) return;
    const canvas = viewer.canvas;

    const onPointerDown = () => {
      pointerDownRef.current = true;
      onInteractRef.current?.();
    };
    const onPointerUp = () => {
      pointerDownRef.current = false;
    };
    const onWheel = () => {
      onInteractRef.current?.();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: true });

    let lastFrameTime = performance.now();
    const onPostRender = () => {
      const now = performance.now();
      const dt = now - lastFrameTime;
      lastFrameTime = now;

      if (!enabledRef.current) return;
      if (pointerDownRef.current) return;
      if (isCameraAnimatingRef.current) return;
      if (document.hidden) return;

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
