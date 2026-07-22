"use client";

import { useEffect, useRef } from "react";
import { useCesium } from "resium";
import { Cartesian3 } from "cesium";
import { useGlobeUi } from "../context/globe-ui-context";

const INITIAL_DELAY_MS = 1500;
const RESUME_DELAY_MS = 4000;
/** One full revolution every 4 minutes — present, never distracting. */
const RADIANS_PER_MS = (2 * Math.PI) / (240 * 1000);

export function GlobeAutoRotate() {
  const { viewer, scene, camera } = useCesium();
  const { isCameraAnimatingRef } = useGlobeUi();
  const resumeAtRef = useRef(Date.now() + INITIAL_DELAY_MS);
  const pointerDownRef = useRef(false);

  useEffect(() => {
    if (!viewer || !scene || !camera) return;
    const canvas = viewer.canvas;

    const markInteraction = () => {
      resumeAtRef.current = Date.now() + RESUME_DELAY_MS;
    };
    const onPointerDown = () => {
      pointerDownRef.current = true;
      markInteraction();
    };
    const onPointerUp = () => {
      pointerDownRef.current = false;
      markInteraction();
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("wheel", markInteraction, { passive: true });

    let lastFrameTime = performance.now();
    const onPostRender = () => {
      const now = performance.now();
      const dt = now - lastFrameTime;
      lastFrameTime = now;

      if (pointerDownRef.current) return;
      if (isCameraAnimatingRef.current) return;
      if (document.hidden) return;
      if (Date.now() < resumeAtRef.current) return;

      camera.rotate(Cartesian3.UNIT_Z, -RADIANS_PER_MS * dt);
    };

    scene.postRender.addEventListener(onPostRender);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("wheel", markInteraction);
      scene.postRender.removeEventListener(onPostRender);
    };
  }, [viewer, scene, camera, isCameraAnimatingRef]);

  return null;
}
