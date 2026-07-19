"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Bell, Flame } from "lucide-react";
import { useEarthquakes } from "@/features/earthquakes/hooks/use-earthquakes";
import { useWildfires } from "@/features/wildfires/hooks/use-wildfires";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { deriveAlerts } from "../lib/derive-alerts";
import { formatMagnitude, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export function AlertsBell() {
  const { data: earthquakes } = useEarthquakes();
  const { data: wildfires } = useWildfires();
  const { setSelectedEntity } = useGlobeUi();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const alerts = useMemo(
    () => deriveAlerts(earthquakes?.quakes, wildfires?.hotspots),
    [earthquakes, wildfires]
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`${alerts.length} active alerts`}
        aria-expanded={open}
        className="glass-panel relative flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {alerts.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
            {alerts.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="glass-panel-elevated absolute right-0 top-11 z-30 max-h-96 w-80 overflow-y-auto rounded-2xl p-2 shadow-2xl"
          >
            <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted">
              Global alerts
            </p>
            {alerts.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted">No active high-severity events</p>
            ) : (
              <ul className="flex flex-col gap-0.5">
                {alerts.map((alert) => {
                  const isEarthquake = alert.kind === "earthquake";
                  const Icon = isEarthquake ? Activity : Flame;
                  const title = isEarthquake
                    ? `${formatMagnitude(alert.data.magnitude)} earthquake`
                    : "High-intensity fire";
                  const subtitle = isEarthquake ? alert.data.place : `${alert.data.frp.toFixed(0)} MW`;
                  const time = isEarthquake ? alert.data.time : alert.data.acquiredAt;

                  return (
                    <li key={alert.id}>
                      <button
                        onClick={() => {
                          setSelectedEntity(
                            isEarthquake
                              ? { type: "earthquake", data: alert.data }
                              : { type: "wildfire", data: alert.data }
                          );
                          setOpen(false);
                        }}
                        className="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-surface-elevated"
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                            alert.severity === "warning" ? "bg-danger/15 text-danger" : "bg-alert/15 text-alert"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-foreground">{title}</span>
                          <span className="block truncate text-xs text-muted">{subtitle}</span>
                        </span>
                        <span className="shrink-0 text-[10px] text-muted">{formatRelativeTime(time)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
