import { Color } from "cesium";

export function colorForMagnitude(magnitude: number): Color {
  if (magnitude < 3) return Color.fromCssColorString("#4ade80");
  if (magnitude < 4.5) return Color.fromCssColorString("#facc15");
  if (magnitude < 6) return Color.fromCssColorString("#fb923c");
  return Color.fromCssColorString("#f2545b");
}

export function pixelSizeForMagnitude(magnitude: number): number {
  return 6 + Math.max(magnitude, 0) * 3;
}
