"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, CloudSun, Flame, Plane, Wind, X } from "lucide-react";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { EarthquakePanelContent } from "@/features/earthquakes/components/earthquake-panel-content";
import { FlightPanelContent } from "@/features/flights/components/flight-panel-content";
import { WeatherPanelContent } from "@/features/weather/components/weather-panel-content";
import { AirQualityPanelContent } from "@/features/air-quality/components/air-quality-panel-content";
import { WildfirePanelContent } from "@/features/wildfires/components/wildfire-panel-content";
import { formatMagnitude } from "@/lib/format";

function panelHeader(selected: NonNullable<ReturnType<typeof useGlobeUi>["selectedEntity"]>) {
  switch (selected.type) {
    case "earthquake":
      return { icon: Activity, title: formatMagnitude(selected.data.magnitude), subtitle: "Earthquake" };
    case "flight":
      return {
        icon: Plane,
        title: selected.data.callsign ?? selected.data.icao24.toUpperCase(),
        subtitle: "Flight",
      };
    case "weather-point":
      return { icon: CloudSun, title: selected.label ?? "Weather", subtitle: "Conditions" };
    case "air-quality-point":
      return { icon: Wind, title: selected.label ?? "Air quality", subtitle: "Air quality" };
    case "wildfire":
      return { icon: Flame, title: "Active fire", subtitle: "Wildfire" };
  }
}

export function EntitySidePanel() {
  const { selectedEntity, setSelectedEntity } = useGlobeUi();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isOpen = selectedEntity !== null;

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedEntity(null);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, setSelectedEntity]);

  const header = selectedEntity ? panelHeader(selectedEntity) : null;

  return (
    <AnimatePresence>
      {isOpen && selectedEntity && header && (
        <>
          <motion.button
            aria-label="Close panel"
            onClick={() => setSelectedEntity(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 cursor-default bg-black/10 sm:bg-transparent"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${header.subtitle} details`}
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="glass-panel-elevated absolute right-4 top-20 z-20 w-[calc(100%-2rem)] max-w-sm rounded-2xl p-5 shadow-2xl sm:right-6 sm:top-24 sm:w-96"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <header.icon className="h-4 w-4 text-accent" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">{header.subtitle}</p>
                  <p className="text-sm font-medium text-foreground">{header.title}</p>
                </div>
              </div>
              <button
                ref={closeButtonRef}
                onClick={() => setSelectedEntity(null)}
                aria-label="Close"
                className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {selectedEntity.type === "earthquake" && <EarthquakePanelContent data={selectedEntity.data} />}
            {selectedEntity.type === "flight" && <FlightPanelContent data={selectedEntity.data} />}
            {selectedEntity.type === "weather-point" && (
              <WeatherPanelContent lat={selectedEntity.lat} lon={selectedEntity.lon} label={selectedEntity.label} />
            )}
            {selectedEntity.type === "air-quality-point" && (
              <AirQualityPanelContent
                lat={selectedEntity.lat}
                lon={selectedEntity.lon}
                label={selectedEntity.label}
              />
            )}
            {selectedEntity.type === "wildfire" && <WildfirePanelContent data={selectedEntity.data} />}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
