import { Color } from "cesium";

interface AqiBand {
  label: string;
  hex: string;
}

const BANDS: AqiBand[] = [
  { label: "Good", hex: "#4ade80" },
  { label: "Moderate", hex: "#facc15" },
  { label: "Unhealthy for sensitive groups", hex: "#fb923c" },
  { label: "Unhealthy", hex: "#f2545b" },
  { label: "Very unhealthy", hex: "#c084fc" },
  { label: "Hazardous", hex: "#7f1d1d" },
];

function bandForAqi(usAqi: number): AqiBand {
  if (usAqi <= 50) return BANDS[0];
  if (usAqi <= 100) return BANDS[1];
  if (usAqi <= 150) return BANDS[2];
  if (usAqi <= 200) return BANDS[3];
  if (usAqi <= 300) return BANDS[4];
  return BANDS[5];
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
