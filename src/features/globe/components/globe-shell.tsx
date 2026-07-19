"use client";

import dynamic from "next/dynamic";
import { GlobeLoadingSkeleton } from "./globe-loading-skeleton";

const GlobeViewer = dynamic(() => import("./globe-viewer").then((mod) => mod.GlobeViewer), {
  ssr: false,
  loading: () => <GlobeLoadingSkeleton />,
});

export function GlobeShell() {
  return (
    <div className="absolute inset-0">
      <GlobeViewer />
    </div>
  );
}
