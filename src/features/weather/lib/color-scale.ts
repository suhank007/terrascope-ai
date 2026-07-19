import { Color } from "cesium";

export function colorForTemperature(celsius: number): Color {
  if (celsius < 0) return Color.fromCssColorString("#7dd3fc");
  if (celsius < 15) return Color.fromCssColorString("#38bdf8");
  if (celsius < 25) return Color.fromCssColorString("#35e0c8");
  if (celsius < 32) return Color.fromCssColorString("#facc15");
  return Color.fromCssColorString("#f2545b");
}
