"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchFlights } from "../api";
import { clampBbox, quantizeBbox } from "../lib/sampling";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { CLOSE_ZOOM_HEIGHT_THRESHOLD } from "@/features/globe/lib/cesium-config";

function useTabVisible() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const onVisibility = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return visible;
}

export function useFlights() {
  const { cameraBounds, cameraHeight } = useGlobeUi();
  const tabVisible = useTabVisible();

  const isZoomedIn = cameraHeight !== null && cameraHeight < CLOSE_ZOOM_HEIGHT_THRESHOLD;
  const quantized = cameraBounds ? quantizeBbox(clampBbox(cameraBounds)) : null;
  const enabled = isZoomedIn && tabVisible && quantized !== null;

  const query = useQuery({
    queryKey: ["flights", quantized],
    queryFn: () => fetchFlights(quantized!),
    enabled,
    refetchInterval: 60_000,
  });

  return { ...query, isZoomedIn };
}
