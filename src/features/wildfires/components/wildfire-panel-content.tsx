import { motion } from "framer-motion";
import { Flame, Gauge, Satellite } from "lucide-react";
import type { WildfireHotspot } from "../types";
import { formatRelativeTime } from "@/lib/format";
import { STAGGER_LIST } from "@/lib/motion";

const CONFIDENCE_LABEL: Record<WildfireHotspot["confidence"], string> = {
  low: "Low confidence",
  nominal: "Nominal confidence",
  high: "High confidence",
};

export function WildfirePanelContent({ data }: { data: WildfireHotspot }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-alert/30 bg-alert/10 text-alert">
          <Flame className="h-5 w-5" />
        </span>
        <div>
          <p className="text-base font-medium text-foreground">Active fire detection</p>
          <p className="text-xs text-muted">{CONFIDENCE_LABEL[data.confidence]}</p>
        </div>
      </div>

      <motion.dl
        initial="hidden"
        animate="visible"
        variants={STAGGER_LIST.container}
        className="grid grid-cols-2 gap-3 text-sm"
      >
        <motion.div variants={STAGGER_LIST.item} className="rounded-lg border border-border bg-surface-elevated/40 p-3">
          <dt className="flex items-center gap-1 text-xs text-muted">
            <Gauge className="h-3 w-3" /> Radiative power
          </dt>
          <dd className="mt-1 font-medium text-foreground">{data.frp.toFixed(1)} MW</dd>
        </motion.div>
        <motion.div variants={STAGGER_LIST.item} className="rounded-lg border border-border bg-surface-elevated/40 p-3">
          <dt className="text-xs text-muted">Brightness</dt>
          <dd className="mt-1 font-medium text-foreground">{data.brightnessK.toFixed(0)} K</dd>
        </motion.div>
        <motion.div variants={STAGGER_LIST.item} className="rounded-lg border border-border bg-surface-elevated/40 p-3">
          <dt className="flex items-center gap-1 text-xs text-muted">
            <Satellite className="h-3 w-3" /> Satellite
          </dt>
          <dd className="mt-1 font-medium text-foreground">{data.satellite}</dd>
        </motion.div>
        <motion.div variants={STAGGER_LIST.item} className="rounded-lg border border-border bg-surface-elevated/40 p-3">
          <dt className="text-xs text-muted">Detected</dt>
          <dd className="mt-1 font-medium text-foreground">{formatRelativeTime(data.acquiredAt)}</dd>
        </motion.div>
      </motion.dl>

      <p className="text-xs text-muted">
        {data.latitude.toFixed(3)}, {data.longitude.toFixed(3)}
      </p>
    </div>
  );
}
