"use client";

import { useEffect, useRef } from "react";
import { useCesium } from "resium";
import { Math as CesiumMath } from "cesium";
import { useGlobeUi } from "../context/globe-ui-context";
import { CAMERA_DEBOUNCE_MS } from "../lib/cesium-config";

export function CameraBoundsWatcher() {
  const { viewer, camera, scene } = useCesium();
  const { setCameraState, cesiumRef } = useGlobeUi();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!viewer || !camera || !scene) return;

    cesiumRef.current = { camera, scene };
    return () => {
      cesiumRef.current = null;
    };
  }, [viewer, camera, scene, cesiumRef]);

  useEffect(() => {
    if (!viewer || !camera || !scene) return;

    const computeAndSet = () => {
      const rect = camera.computeViewRectangle(scene.globe.ellipsoid);
      const height = camera.positionCartographic.height;
      if (!rect) {
        setCameraState(null, height);
        return;
      }
      setCameraState(
        {
          west: CesiumMath.toDegrees(rect.west),
          south: CesiumMath.toDegrees(rect.south),
          east: CesiumMath.toDegrees(rect.east),
          north: CesiumMath.toDegrees(rect.north),
        },
        height
      );
    };

    const onMoveEnd = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(computeAndSet, CAMERA_DEBOUNCE_MS);
    };

    computeAndSet();
    camera.moveEnd.addEventListener(onMoveEnd);

    return () => {
      camera.moveEnd.removeEventListener(onMoveEnd);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [viewer, camera, scene, setCameraState]);

  return null;
}
