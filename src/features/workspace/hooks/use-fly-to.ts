import { useCallback } from "react";
import { Cartesian2, Cartesian3, EasingFunction, Math as CesiumMath } from "cesium";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";

const FLY_DURATION_S = 1.8;

/** Whole-Earth framing for the docked layout: centred over Africa/Europe
 *  (the densest mix of layers) and close enough that the globe fills its frame. */
export const HOME_VIEW = { longitude: 20, latitude: 15, height: 9_500_000 } as const;

/** Imperative camera moves for the docked UI. Mirrors what SearchBar does:
 *  flags the camera as animating so nothing else fights the flight. */
export function useCameraActions() {
  const { cesiumRef, isCameraAnimatingRef } = useGlobeUi();

  const flyTo = useCallback(
    (longitude: number, latitude: number, height: number, duration = FLY_DURATION_S) => {
      const live = cesiumRef.current;
      if (!live) return;

      isCameraAnimatingRef.current = true;
      const settle = () => {
        isCameraAnimatingRef.current = false;
      };
      live.camera.flyTo({
        destination: Cartesian3.fromDegrees(longitude, latitude, height),
        duration,
        easingFunction: EasingFunction.QUADRATIC_IN_OUT,
        complete: settle,
        cancel: settle,
      });
    },
    [cesiumRef, isCameraAnimatingRef]
  );

  const zoomBy = useCallback(
    (factor: number) => {
      const live = cesiumRef.current;
      if (!live) return;
      const height = live.camera.positionCartographic.height;
      const amount = height * Math.abs(factor);
      if (factor > 0) live.camera.zoomIn(amount);
      else live.camera.zoomOut(amount);
    },
    [cesiumRef]
  );

  const resetView = useCallback(
    () => flyTo(HOME_VIEW.longitude, HOME_VIEW.latitude, HOME_VIEW.height, 2.2),
    [flyTo]
  );

  /** Dive to regional height over whatever is at the centre of the view, which
   *  is where flights start loading. */
  const zoomToRegion = useCallback(() => {
    const live = cesiumRef.current;
    if (!live) return;
    const canvas = live.scene.canvas;
    const point = live.camera.pickEllipsoid(
      new Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2),
      live.scene.globe.ellipsoid
    );
    const carto = point ? live.scene.globe.ellipsoid.cartesianToCartographic(point) : null;
    flyTo(carto ? CesiumMath.toDegrees(carto.longitude) : 0, carto ? CesiumMath.toDegrees(carto.latitude) : 20, 3_000_000);
  }, [cesiumRef, flyTo]);

  return { flyTo, zoomBy, resetView, zoomToRegion };
}
