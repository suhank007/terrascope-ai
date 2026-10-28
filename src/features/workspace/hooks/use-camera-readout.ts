import { useEffect, useState } from "react";
import { Cartesian2, Math as CesiumMath } from "cesium";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";

export interface CameraReadout {
  latitude: number;
  longitude: number;
}

const POLL_MS = 250;

/** The lat/lon under the middle of the viewport, or null when the centre
 *  points at space (fully zoomed out past the limb). Polled rather than
 *  event-driven so it also tracks the camera mid-flight. */
export function useCameraReadout(): CameraReadout | null {
  const { cesiumRef } = useGlobeUi();
  const [readout, setReadout] = useState<CameraReadout | null>(null);

  useEffect(() => {
    const tick = () => {
      const live = cesiumRef.current;
      if (!live || document.hidden) return;

      const canvas = live.scene.canvas;
      const centre = new Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2);
      const point = live.camera.pickEllipsoid(centre, live.scene.globe.ellipsoid);
      const next = point
        ? (() => {
            const carto = live.scene.globe.ellipsoid.cartesianToCartographic(point);
            return {
              latitude: Math.round(CesiumMath.toDegrees(carto.latitude) * 10) / 10,
              longitude: Math.round(CesiumMath.toDegrees(carto.longitude) * 10) / 10,
            };
          })()
        : null;

      setReadout((prev) =>
        prev?.latitude === next?.latitude && prev?.longitude === next?.longitude ? prev : next
      );
    };

    tick();
    const id = setInterval(tick, POLL_MS);
    return () => clearInterval(id);
  }, [cesiumRef]);

  return readout;
}
