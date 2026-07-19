"use client";

import { GlobeUiProvider } from "../context/globe-ui-context";
import { GlobeShell } from "./globe-shell";
import { HudOverlay } from "./hud-overlay";
import { EntitySidePanel } from "@/features/side-panel/components/entity-side-panel";

export function GlobeExperience() {
  return (
    <GlobeUiProvider>
      <main className="relative h-dvh w-dvw overflow-hidden bg-background">
        <GlobeShell />
        <HudOverlay />
        <EntitySidePanel />
      </main>
    </GlobeUiProvider>
  );
}
