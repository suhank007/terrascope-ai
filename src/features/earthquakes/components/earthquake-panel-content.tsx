import { motion } from "framer-motion";
import { AlertTriangle, ArrowUpRight, Clock, Gauge } from "lucide-react";
import type { Earthquake } from "../types";
import { formatMagnitude, formatRelativeTime } from "@/lib/format";
import { colorForMagnitude } from "../lib/color-scale";
import { STAGGER_LIST } from "@/lib/motion";

export function EarthquakePanelContent({ data }: { data: Earthquake }) {
  const color = colorForMagnitude(data.magnitude).toCssColorString();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-background"
          style={{ backgroundColor: color }}
        >
          {formatMagnitude(data.magnitude)}
        </span>
        <div>
          <p className="text-base font-medium text-foreground">{data.place}</p>
          <p className="flex items-center gap-1 text-xs text-muted">
            <Clock className="h-3 w-3" /> {formatRelativeTime(data.time)}
          </p>
        </div>
      </div>

      {data.tsunami && (
        <div className="flex items-center gap-2 rounded-lg border border-alert/30 bg-alert/10 px-3 py-2 text-xs text-alert">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Tsunami advisory issued for this event
        </div>
      )}

      <motion.dl
        initial="hidden"
        animate="visible"
        variants={STAGGER_LIST.container}
        className="grid grid-cols-2 gap-3 text-sm"
      >
        <motion.div variants={STAGGER_LIST.item} className="rounded-lg border border-border bg-surface-elevated/40 p-3">
          <dt className="flex items-center gap-1 text-xs text-muted">
            <Gauge className="h-3 w-3" /> Depth
          </dt>
          <dd className="mt-1 font-medium text-foreground">{data.depthKm.toFixed(1)} km</dd>
        </motion.div>
        <motion.div variants={STAGGER_LIST.item} className="rounded-lg border border-border bg-surface-elevated/40 p-3">
          <dt className="text-xs text-muted">Coordinates</dt>
          <dd className="mt-1 font-medium text-foreground">
            {data.latitude.toFixed(2)}, {data.longitude.toFixed(2)}
          </dd>
        </motion.div>
      </motion.dl>

      <a
        href={data.url}
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-elevated/60 py-2.5 text-sm text-foreground transition-colors hover:border-accent/50 hover:text-accent active:scale-[0.98]"
      >
        View on USGS <ArrowUpRight className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
