import { Camera, Cartesian3, EasingFunction, Math as CesiumMath } from "cesium";
import type { CameraState } from "../types";

export function captureCameraState(camera: Camera): CameraState {
  const carto = camera.positionCartographic;
  return {
    longitude: CesiumMath.toDegrees(carto.longitude),
    latitude: CesiumMath.toDegrees(carto.latitude),
    height: carto.height,
    heading: camera.heading,
    pitch: camera.pitch,
    roll: camera.roll,
  };
}

export function flyToCameraState(
  camera: Camera,
  state: CameraState,
  onSettled?: () => void
) {
  camera.flyTo({
    destination: Cartesian3.fromDegrees(state.longitude, state.latitude, state.height),
    orientation: { heading: state.heading, pitch: state.pitch, roll: state.roll },
    duration: 2.4,
    easingFunction: EasingFunction.QUADRATIC_IN_OUT,
    complete: onSettled,
    cancel: onSettled,
  });
}
