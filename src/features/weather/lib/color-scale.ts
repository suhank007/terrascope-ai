import { Color } from "cesium";

export const WEATHER_LEGEND = [
  { label: "Below 0°C", hex: "#7dd3fc" },
  { label: "0°C – 15°C", hex: "#38bdf8" },
  { label: "15°C – 25°C", hex: "#35e0c8" },
  { label: "25°C – 32°C", hex: "#facc15" },
  { label: "Above 32°C", hex: "#f2545b" },
];

export function colorForTemperature(celsius: number): Color {
  if (celsius < 0) return Color.fromCssColorString("#7dd3fc");
  if (celsius < 15) return Color.fromCssColorString("#38bdf8");
  if (celsius < 25) return Color.fromCssColorString("#35e0c8");
  if (celsius < 32) return Color.fromCssColorString("#facc15");
  return Color.fromCssColorString("#f2545b");
}
