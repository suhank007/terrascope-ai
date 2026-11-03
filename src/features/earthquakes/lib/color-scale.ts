import { Color } from "cesium";

export const EARTHQUAKE_LEGEND = [
  { label: "Below M3.0", hex: "#15803d" },
  { label: "M3.0 – M4.5", hex: "#a16207" },
  { label: "M4.5 – M6.0", hex: "#c2410c" },
  { label: "M6.0+", hex: "#b91c1c" },
];

export function colorForMagnitude(magnitude: number): Color {
  if (magnitude < 3) return Color.fromCssColorString("#15803d");
  if (magnitude < 4.5) return Color.fromCssColorString("#a16207");
  if (magnitude < 6) return Color.fromCssColorString("#c2410c");
  return Color.fromCssColorString("#b91c1c");
}

export function pixelSizeForMagnitude(magnitude: number): number {
  return 6 + Math.max(magnitude, 0) * 3;
}
