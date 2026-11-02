const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

export function compassPoint(degrees: number): string {
  return COMPASS[Math.round((((degrees % 360) + 360) % 360) / 45) % 8];
}

/** One plain sentence per US AQI band, following the EPA's own guidance. */
export function aqiAdvice(usAqi: number): string {
  if (usAqi <= 50) return "Air quality is satisfactory. Outdoor activity is fine for everyone.";
  if (usAqi <= 100) return "Acceptable for most people. Unusually sensitive people may want to take it easier outdoors.";
  if (usAqi <= 150) return "People with asthma, heart or lung conditions, children and older adults should limit long outdoor exertion.";
  if (usAqi <= 200) return "Everyone may start to feel effects. Sensitive groups should avoid outdoor exertion.";
  if (usAqi <= 300) return "Health warning. Everyone should cut back on outdoor activity.";
  return "Hazardous. Stay indoors and keep windows closed if you can.";
}

/** USGS magnitude classes, so "M4.6" comes with what it usually feels like. */
export function quakeFeel(magnitude: number): string {
  if (magnitude < 3) return "Rarely felt";
  if (magnitude < 4) return "Often felt, rarely damaging";
  if (magnitude < 5) return "Noticeable shaking, minor damage unlikely";
  if (magnitude < 6) return "Can damage poorly built structures";
  if (magnitude < 7) return "Damaging in populated areas";
  return "Major, widespread damage possible";
}

/** Fire radiative power (MW) of one satellite pixel, in plain words. */
export function fireIntensity(frp: number): string {
  if (frp < 10) return "Small";
  if (frp < 50) return "Moderate";
  if (frp < 150) return "Intense";
  return "Very intense";
}
