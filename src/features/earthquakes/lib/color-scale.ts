import { Color } from "cesium";

export const EARTHQUAKE_LEGEND = [
  { label: "Below M3.0", hex: "#4ade80" },
  { label: "M3.0 – M4.5", hex: "#facc15" },
  { label: "M4.5 – M6.0", hex: "#fb923c" },
  { label: "M6.0+", hex: "#f2545b" },
];

export function colorForMagnitude(magnitude: number): Color {
  if (magnitude < 3) return Color.fromCssColorString("#4ade80");
  if (magnitude < 4.5) return Color.fromCssColorString("#facc15");
  if (magnitude < 6) return Color.fromCssColorString("#fb923c");
  return Color.fromCssColorString("#f2545b");
}

export function pixelSizeForMagnitude(magnitude: number): number {
  return 6 + Math.max(magnitude, 0) * 3;
}
