import type { Layers } from "@/features/globe/context/globe-ui-context";

export interface CameraState {
  longitude: number;
  latitude: number;
  height: number;
  heading: number;
  pitch: number;
  roll: number;
}

export interface SavedView {
  id: string;
  name: string;
  camera: CameraState;
  layers: Layers;
  selectedAirlines: string[];
  createdAt: string;
}

export interface CreateSavedViewInput {
  name: string;
  camera: CameraState;
  layers: Layers;
  selectedAirlines: string[];
}
