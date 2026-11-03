import { Color } from "cesium";

export const WILDFIRE_LEGEND = [
  { label: "Low confidence", hex: "#a16207" },
  { label: "Nominal confidence", hex: "#c2410c" },
  { label: "High confidence", hex: "#b91c1c" },
];

export function colorForConfidence(confidence: "low" | "nominal" | "high"): Color {
  if (confidence === "high") return Color.fromCssColorString("#b91c1c");
  if (confidence === "nominal") return Color.fromCssColorString("#c2410c");
  return Color.fromCssColorString("#a16207");
}

export function pixelSizeForFrp(frp: number): number {
  return 6 + Math.min(Math.sqrt(Math.max(frp, 0)), 14);
}
