import { Color } from "cesium";

export const FLIGHT_LEGEND = [
  { label: "On ground", hex: "#8891a1" },
  { label: "Below 3,000m", hex: "#38bdf8" },
  { label: "3,000m – 9,000m", hex: "#35e0c8" },
  { label: "Above 9,000m", hex: "#f2f1ee" },
];

export function colorForAltitude(altitudeM: number | null, onGround: boolean): Color {
  if (onGround) return Color.fromCssColorString("#8891a1");
  if (altitudeM === null) return Color.fromCssColorString("#8891a1");
  if (altitudeM < 3000) return Color.fromCssColorString("#38bdf8");
  if (altitudeM < 9000) return Color.fromCssColorString("#35e0c8");
  return Color.fromCssColorString("#f2f1ee");
}
