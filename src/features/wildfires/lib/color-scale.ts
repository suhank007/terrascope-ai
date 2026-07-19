import { Color } from "cesium";

export function colorForConfidence(confidence: "low" | "nominal" | "high"): Color {
  if (confidence === "high") return Color.fromCssColorString("#f2545b");
  if (confidence === "nominal") return Color.fromCssColorString("#fb923c");
  return Color.fromCssColorString("#facc15");
}

export function pixelSizeForFrp(frp: number): number {
  return 6 + Math.min(Math.sqrt(Math.max(frp, 0)), 14);
}
