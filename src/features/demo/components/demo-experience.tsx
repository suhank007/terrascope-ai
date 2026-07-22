"use client";

import { GlobeUiProvider } from "@/features/globe/context/globe-ui-context";
import { GlobeShell } from "@/features/globe/components/globe-shell";
import { HudOverlay } from "@/features/globe/components/hud-overlay";
import { EntitySidePanel } from "@/features/side-panel/components/entity-side-panel";
import { DemoModeProvider } from "../context/demo-mode-context";
import { DemoToolbar } from "./demo-toolbar";
import { DemoIntro } from "./demo-intro";

/**
 * Reuses the production globe/HUD/side-panel tree as-is — nothing here is a
 * fork or a copy. DemoModeProvider and the two demo-only components
 * (DemoIntro, DemoToolbar) are the entire delta; every shared component
 * that behaves differently in demo mode does so via an optional context
 * check (useDemoModeOptional) that's a no-op wherever this provider isn't
 * mounted, i.e. everywhere outside this file.
 */
export function DemoExperience() {
  return (
    <GlobeUiProvider>
      <DemoModeProvider>
        <main className="relative h-dvh w-dvw overflow-hidden bg-background">
          <GlobeShell />
          <HudOverlay />
          <EntitySidePanel />
          <DemoIntro />
          <DemoToolbar />
        </main>
      </DemoModeProvider>
    </GlobeUiProvider>
  );
}
