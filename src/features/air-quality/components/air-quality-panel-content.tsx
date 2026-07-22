import { motion } from "framer-motion";
import { Wind } from "lucide-react";
import { useAirQuality } from "../hooks/use-air-quality";
import { aqiHexColor, aqiLabel } from "../lib/aqi-scale";
import { formatCoordinate, formatRelativeTime } from "@/lib/format";
import { STAGGER_LIST } from "@/lib/motion";

function AirQualitySkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-surface-elevated" />
        <div className="flex flex-col gap-2">
          <div className="h-5 w-24 rounded bg-surface-elevated" />
          <div className="h-3 w-14 rounded bg-surface-elevated" />
        </div>
      </div>
      <div className="h-3 w-40 rounded bg-surface-elevated" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-14 rounded-lg bg-surface-elevated/60" />
        <div className="h-14 rounded-lg bg-surface-elevated/60" />
        <div className="h-14 rounded-lg bg-surface-elevated/60" />
        <div className="h-14 rounded-lg bg-surface-elevated/60" />
      </div>
    </div>
  );
}

export function AirQualityPanelContent({ lat, lon, label }: { lat: number; lon: number; label?: string }) {
  const { data, isLoading, isError } = useAirQuality(lat, lon);

  if (isLoading) return <AirQualitySkeleton />;

  if (isError || !data) {
    return <p className="py-10 text-center text-sm text-muted">Air quality data unavailable for this point.</p>;
  }

  const color = aqiHexColor(data.current.usAqi);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-background"
          style={{ backgroundColor: color }}
        >
          {Math.round(data.current.usAqi)}
        </span>
        <div>
          <p className="text-base font-medium text-foreground">{aqiLabel(data.current.usAqi)}</p>
          <p className="text-xs text-muted">US AQI</p>
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
            <Wind className="h-3 w-3" /> PM2.5
          </dt>
          <dd className="mt-1 font-medium text-foreground">{data.current.pm2_5.toFixed(1)} µg/m³</dd>
        </motion.div>
        <motion.div variants={STAGGER_LIST.item} className="rounded-lg border border-border bg-surface-elevated/40 p-3">
          <dt className="text-xs text-muted">PM10</dt>
          <dd className="mt-1 font-medium text-foreground">{data.current.pm10.toFixed(1)} µg/m³</dd>
        </motion.div>
        <motion.div variants={STAGGER_LIST.item} className="rounded-lg border border-border bg-surface-elevated/40 p-3">
          <dt className="text-xs text-muted">Ozone</dt>
          <dd className="mt-1 font-medium text-foreground">{data.current.ozone.toFixed(0)} µg/m³</dd>
        </motion.div>
        <motion.div variants={STAGGER_LIST.item} className="rounded-lg border border-border bg-surface-elevated/40 p-3">
          <dt className="text-xs text-muted">NO₂</dt>
          <dd className="mt-1 font-medium text-foreground">{data.current.nitrogenDioxide.toFixed(0)} µg/m³</dd>
        </motion.div>
      </motion.dl>
    </div>
  );
}
