import { Color } from "cesium";

export const FLIGHT_LEGEND = [
  { label: "On ground", hex: "#8a94a3" },
  { label: "Below 3,000m", hex: "#60a5fa" },
  { label: "3,000m – 9,000m", hex: "#2563eb" },
  { label: "Above 9,000m", hex: "#0b1d33" },
];

export function colorForAltitude(altitudeM: number | null, onGround: boolean): Color {
  if (onGround) return Color.fromCssColorString("#8a94a3");
  if (altitudeM === null) return Color.fromCssColorString("#8a94a3");
  if (altitudeM < 3000) return Color.fromCssColorString("#60a5fa");
  if (altitudeM < 9000) return Color.fromCssColorString("#2563eb");
  return Color.fromCssColorString("#0b1d33");
}
