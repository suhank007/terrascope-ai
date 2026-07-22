import { Color } from "cesium";

interface AqiBand {
  label: string;
  hex: string;
}

export const AQI_LEGEND: AqiBand[] = [
  { label: "Good", hex: "#4ade80" },
  { label: "Moderate", hex: "#facc15" },
  { label: "Unhealthy for sensitive groups", hex: "#fb923c" },
  { label: "Unhealthy", hex: "#f2545b" },
  { label: "Very unhealthy", hex: "#c084fc" },
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
