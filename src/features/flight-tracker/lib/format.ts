const POINTS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

/** 192 -> "S" (heading, nearest of 16 compass points). */
export function compassPoint(degrees: number): string {
  const d = ((degrees % 360) + 360) % 360;
  return POINTS[Math.round(d / 22.5) % 16];
}

/** Level flight reads as ±300 fpm of noise; only a clear rate counts as climbing or descending. */
export function verticalTrend(fpm: number | null): "Climbing" | "Descending" | "Level" | null {
  if (fpm === null) return null;
  if (fpm >= 300) return "Climbing";
  if (fpm <= -300) return "Descending";
  return "Level";
}

export function formatAltitude(ft: number | null, onGround: boolean): string {
  if (onGround) return "On the ground";
  if (ft === null) return "—";
  return ft >= 18_000 ? `FL${String(Math.round(ft / 100)).padStart(3, "0")}` : `${ft.toLocaleString()} ft`;
}
