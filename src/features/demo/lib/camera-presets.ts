import { Camera, Cartesian3, EasingFunction, Math as CesiumMath } from "cesium";

export interface CameraPreset {
  id: string;
  label: string;
  longitude: number;
  latitude: number;
  height: number;
}

/** The six presets requested for the demo toolbar, in display order. */
export const CAMERA_PRESETS: CameraPreset[] = [
  { id: "global", label: "Global View", longitude: 10, latitude: 15, height: 20_000_000 },
  { id: "europe", label: "Europe", longitude: 15, latitude: 50, height: 4_000_000 },
  { id: "north-america", label: "North America", longitude: -100, latitude: 40, height: 6_000_000 },
  { id: "asia", label: "Asia", longitude: 100, latitude: 30, height: 6_500_000 },
  { id: "australia", label: "Australia", longitude: 134, latitude: -25, height: 5_000_000 },
  { id: "arctic", label: "Arctic", longitude: 0, latitude: 78, height: 6_000_000 },
];

export const GLOBAL_VIEW = CAMERA_PRESETS[0];

export const TOKYO_VIEW: CameraPreset = {
  id: "tokyo",
  label: "Tokyo",
  longitude: 139.6503,
  latitude: 35.6762,
  height: 900_000,
};

/** Oblique opening shot for the demo intro — deliberately not a clickable preset. */
const CINEMATIC_INTRO = {
  longitude: 25,
  latitude: 18,
  height: 14_000_000,
  heading: CesiumMath.toRadians(15),
  pitch: CesiumMath.toRadians(-50),
};

const FLY_DURATION_S = 2.8;

/**
 * Every camera.flyTo in demo mode (presets, guided-demo steps, the intro
 * shot) goes through this one helper, mirroring the coordination pattern
 * already established for search/saved-views: flag isCameraAnimatingRef so
 * GlobeAutoRotate yields for the duration of the flight, and always resolve
 * the flag via both `complete` and `cancel` so an interrupted flight can't
 * leave rotation stuck off.
 */
function flyCamera(
  camera: Camera,
  isCameraAnimatingRef: { current: boolean },
  options: { destination: Cartesian3; orientation?: { heading: number; pitch: number; roll: number } },
  onDone?: () => void
) {
  isCameraAnimatingRef.current = true;
  const settle = () => {
    isCameraAnimatingRef.current = false;
    onDone?.();
  };
  camera.flyTo({
    destination: options.destination,
    orientation: options.orientation,
    duration: FLY_DURATION_S,
    easingFunction: EasingFunction.QUADRATIC_IN_OUT,
    complete: settle,
    cancel: settle,
  });
}

export function flyToPreset(
  camera: Camera,
  preset: CameraPreset,
  isCameraAnimatingRef: { current: boolean },
  onDone?: () => void
) {
  flyCamera(
    camera,
    isCameraAnimatingRef,
    { destination: Cartesian3.fromDegrees(preset.longitude, preset.latitude, preset.height) },
    onDone
  );
}

export function flyToCinematicIntro(camera: Camera, isCameraAnimatingRef: { current: boolean }, onDone?: () => void) {
  flyCamera(
    camera,
    isCameraAnimatingRef,
    {
      destination: Cartesian3.fromDegrees(CINEMATIC_INTRO.longitude, CINEMATIC_INTRO.latitude, CINEMATIC_INTRO.height),
      orientation: { heading: CINEMATIC_INTRO.heading, pitch: CINEMATIC_INTRO.pitch, roll: 0 },
    },
    onDone
  );
}
