"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { hasWebGL } from "../lib/webgl";
import { GlobeErrorBoundary } from "./globe-error-boundary";
import { GlobeLoadingSkeleton } from "./globe-loading-skeleton";
import { GlobeUnavailable } from "./globe-unavailable";

const GlobeViewer = dynamic(() => import("./globe-viewer").then((mod) => mod.GlobeViewer), {
  ssr: false,
  loading: () => <GlobeLoadingSkeleton />,
});

const subscribe = () => () => {};

export function GlobeShell() {
  // The server snapshot says "yes" so the first paint is the loading skeleton; the client then reads the real answer.
  const webgl = useSyncExternalStore(subscribe, hasWebGL, () => true);

  return (
    <div className="absolute inset-0">
      {webgl ? (
        <GlobeErrorBoundary>
          <GlobeViewer />
        </GlobeErrorBoundary>
      ) : (
        <GlobeUnavailable />
      )}
    </div>
  );
}
