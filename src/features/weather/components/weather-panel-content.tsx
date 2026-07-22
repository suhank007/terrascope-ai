import { motion } from "framer-motion";
import { Droplets, Wind } from "lucide-react";
import { useWeather } from "../hooks/use-weather";
import { weatherCodeInfo } from "../lib/weather-code";
import { formatCoordinate, formatRelativeTime, formatTemperature, formatWindKph } from "@/lib/format";
import { STAGGER_LIST } from "@/lib/motion";

function WeatherSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-surface-elevated" />
        <div className="flex flex-col gap-2">
          <div className="h-6 w-16 rounded bg-surface-elevated" />
          <div className="h-3 w-20 rounded bg-surface-elevated" />
        </div>
      </div>
      <div className="h-3 w-40 rounded bg-surface-elevated" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-14 rounded-lg bg-surface-elevated/60" />
        <div className="h-14 rounded-lg bg-surface-elevated/60" />
      </div>
      <div className="h-3 w-32 rounded bg-surface-elevated" />
    </div>
  );
}

export function WeatherPanelContent({ lat, lon, label }: { lat: number; lon: number; label?: string }) {
  const { data, isLoading, isError } = useWeather(lat, lon);

  if (isLoading) return <WeatherSkeleton />;

  if (isError || !data) {
    return <p className="py-10 text-center text-sm text-muted">Weather data unavailable for this point.</p>;
  }

  const { icon: Icon, label: condition } = weatherCodeInfo(data.current.weatherCode);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/30 bg-accent-soft">
          <Icon className="h-5 w-5 text-accent" />
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

      <motion.dl
        initial="hidden"
        animate="visible"
        variants={STAGGER_LIST.container}
        className="grid grid-cols-2 gap-3 text-sm"
      >
        <motion.div variants={STAGGER_LIST.item} className="rounded-lg border border-border bg-surface-elevated/40 p-3">
          <dt className="flex items-center gap-1 text-xs text-muted">
            <Wind className="h-3 w-3" /> Wind
          </dt>
          <dd className="mt-1 font-medium text-foreground">{formatWindKph(data.current.windSpeedKph)}</dd>
        </motion.div>
        <motion.div variants={STAGGER_LIST.item} className="rounded-lg border border-border bg-surface-elevated/40 p-3">
          <dt className="flex items-center gap-1 text-xs text-muted">
            <Droplets className="h-3 w-3" /> Humidity
          </dt>
          <dd className="mt-1 font-medium text-foreground">{Math.round(data.current.humidityPct)}%</dd>
        </motion.div>
      </motion.dl>

      <p className="text-xs text-muted">
        Feels like {formatTemperature(data.current.apparentTemperatureC)}
      </p>
    </div>
  );
}
