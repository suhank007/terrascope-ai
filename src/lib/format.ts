export function formatMagnitude(magnitude: number): string {
  return `M${magnitude.toFixed(1)}`;
}

export function formatAltitudeFt(meters: number | null): string {
  if (meters === null) return "—";
  return `${Math.round(meters * 3.28084).toLocaleString()} ft`;
}

export function formatSpeedKt(metersPerSecond: number | null): string {
  if (metersPerSecond === null) return "—";
  return `${Math.round(metersPerSecond * 1.94384)} kt`;
}

export function formatTemperature(celsius: number): string {
  return `${Math.round(celsius)}°C`;
}

export function formatWindKph(kph: number): string {
  return `${Math.round(kph)} km/h`;
}

export function formatRelativeTime(iso: string): string {
  const deltaMs = Date.now() - new Date(iso).getTime();
  const deltaSec = Math.round(deltaMs / 1000);
  if (deltaSec < 60) return "just now";
  const deltaMin = Math.round(deltaSec / 60);
  if (deltaMin < 60) return `${deltaMin}m ago`;
  const deltaHr = Math.round(deltaMin / 60);
  if (deltaHr < 24) return `${deltaHr}h ago`;
  const deltaDay = Math.round(deltaHr / 24);
  return `${deltaDay}d ago`;
}

export function formatCoordinate(value: number, kind: "lat" | "lon"): string {
  const dir = kind === "lat" ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  return `${Math.abs(value).toFixed(2)}°${dir}`;
}
