import { Color } from "cesium";

export const WEATHER_LEGEND = [
  { label: "Below 0°C", hex: "#0ea5e9" },
  { label: "0°C – 15°C", hex: "#0369a1" },
  { label: "15°C – 25°C", hex: "#0f766e" },
  { label: "25°C – 32°C", hex: "#a16207" },
  { label: "Above 32°C", hex: "#b91c1c" },
];

export function colorForTemperature(celsius: number): Color {
  if (celsius < 0) return Color.fromCssColorString("#0ea5e9");
  if (celsius < 15) return Color.fromCssColorString("#0369a1");
  if (celsius < 25) return Color.fromCssColorString("#0f766e");
  if (celsius < 32) return Color.fromCssColorString("#a16207");
  return Color.fromCssColorString("#b91c1c");
}
