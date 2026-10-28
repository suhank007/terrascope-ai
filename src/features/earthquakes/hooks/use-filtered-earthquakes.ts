import { useMemo } from "react";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { useEarthquakes } from "./use-earthquakes";

/** The earthquake feed with the workspace's minimum-magnitude filter applied.
 *  Same React Query entry as useEarthquakes, so it adds no network requests. */
export function useFilteredEarthquakes(active = true) {
  const query = useEarthquakes(active);
  const { minMagnitude } = useGlobeUi();

  const quakes = useMemo(
    () => query.data?.quakes.filter((quake) => quake.magnitude >= minMagnitude),
    [query.data, minMagnitude]
  );

  return { ...query, quakes };
}
