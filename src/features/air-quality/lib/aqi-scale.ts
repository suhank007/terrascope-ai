import { Color } from "cesium";

interface AqiBand {
  label: string;
  hex: string;
}

export const AQI_LEGEND: AqiBand[] = [
  { label: "Good", hex: "#15803d" },
  { label: "Moderate", hex: "#a16207" },
  { label: "Unhealthy for sensitive groups", hex: "#c2410c" },
  { label: "Unhealthy", hex: "#b91c1c" },
  { label: "Very unhealthy", hex: "#7e22ce" },
  { label: "Hazardous", hex: "#7f1d1d" },
];

function bandForAqi(usAqi: number): AqiBand {
  if (usAqi <= 50) return AQI_LEGEND[0];
  if (usAqi <= 100) return AQI_LEGEND[1];
  if (usAqi <= 150) return AQI_LEGEND[2];
  if (usAqi <= 200) return AQI_LEGEND[3];
  if (usAqi <= 300) return AQI_LEGEND[4];
  return AQI_LEGEND[5];
}

export function aqiLabel(usAqi: number): string {
  return bandForAqi(usAqi).label;
}

export function aqiHexColor(usAqi: number): string {
  return bandForAqi(usAqi).hex;
}

export function aqiCesiumColor(usAqi: number): Color {
  return Color.fromCssColorString(bandForAqi(usAqi).hex);
}

/** Threshold above which a city counts as an active air-quality alert. */
export const AQI_ALERT_THRESHOLD = 150;
