"use client";

import { GlobeUiProvider } from "../context/globe-ui-context";
import { GlobeShell } from "./globe-shell";
import { TopBar } from "@/features/workspace/components/top-bar";
import { LeftRail } from "@/features/workspace/components/left-rail";
import { RightDock } from "@/features/workspace/components/right-dock";
import { GlobeOverlays } from "@/features/workspace/components/globe-overlays";
import { WorkspaceFooter } from "@/features/workspace/components/footer";
import { MobileChrome } from "@/features/workspace/components/mobile-chrome";

/**
 * Two layouts over one globe. Below `xl` the globe fills the screen with a
 * compact top bar and a bottom sheet holding the signal explorer. From `xl`
 * up it becomes a docked workspace: top bar, layers/filters rail, globe,
 * signal explorer, footer. The globe is mounted once and only its container
 * changes, so crossing the breakpoint never reloads Cesium. (The demo route
 * keeps the original floating HUD at every width.)
 */
export function GlobeExperience() {
  return (
    <GlobeUiProvider>
      <main className="relative h-dvh w-dvw overflow-hidden bg-background xl:grid xl:grid-cols-[19rem_minmax(0,1fr)_22rem] xl:grid-rows-[auto_minmax(0,1fr)_auto] xl:gap-3 xl:p-4 2xl:grid-cols-[20rem_minmax(0,1fr)_24rem]">
        <TopBar className="hidden xl:col-span-3 xl:row-start-1 xl:flex" />
        <LeftRail className="hidden xl:col-start-1 xl:row-start-2 xl:flex" />

        <div className="absolute inset-0 xl:relative xl:inset-auto xl:col-start-2 xl:row-start-2 xl:overflow-hidden xl:rounded-2xl xl:border xl:border-border">
          <GlobeShell />
          <GlobeOverlays />
        </div>

        <RightDock className="hidden xl:col-start-3 xl:row-start-2 xl:block" />
        <WorkspaceFooter className="hidden xl:col-span-3 xl:row-start-3 xl:flex" />

        <MobileChrome className="xl:hidden" />
      </main>
    </GlobeUiProvider>
  );
}
