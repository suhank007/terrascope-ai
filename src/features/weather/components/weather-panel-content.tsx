import { Droplets, Loader2, Wind } from "lucide-react";
import { useWeather } from "../hooks/use-weather";
import { weatherCodeInfo } from "../lib/weather-code";
import { formatCoordinate, formatRelativeTime, formatTemperature, formatWindKph } from "@/lib/format";

export function WeatherPanelContent({ lat, lon, label }: { lat: number; lon: number; label?: string }) {
  const { data, isLoading, isError } = useWeather(lat, lon);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Fetching conditions…
      </div>
    );
  }

  if (isError || !data) {
    return <p className="py-10 text-center text-sm text-muted">Weather data unavailable for this point.</p>;
  }

  const { icon: Icon, label: condition } = weatherCodeInfo(data.current.weatherCode);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent-soft">
          <Icon className="h-7 w-7 text-accent" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-foreground">
            {formatTemperature(data.current.temperatureC)}
          </p>
          <p className="text-xs text-muted">{condition}</p>
        </div>
      </div>

      <p className="text-sm text-muted">
        {label ?? formatCoordinate(lat, "lat") + ", " + formatCoordinate(lon, "lon")}
        {" · "}
        {formatRelativeTime(data.current.observedAt)}
      </p>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-border bg-surface-elevated/40 p-3">
          <dt className="flex items-center gap-1 text-xs text-muted">
            <Wind className="h-3 w-3" /> Wind
          </dt>
          <dd className="mt-1 font-medium text-foreground">{formatWindKph(data.current.windSpeedKph)}</dd>
        </div>
        <div className="rounded-lg border border-border bg-surface-elevated/40 p-3">
          <dt className="flex items-center gap-1 text-xs text-muted">
            <Droplets className="h-3 w-3" /> Humidity
          </dt>
          <dd className="mt-1 font-medium text-foreground">{Math.round(data.current.humidityPct)}%</dd>
        </div>
      </dl>

      <p className="text-xs text-muted">
        Feels like {formatTemperature(data.current.apparentTemperatureC)}
      </p>
    </div>
  );
}
