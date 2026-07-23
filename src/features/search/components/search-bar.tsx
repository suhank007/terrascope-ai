"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cartesian3, EasingFunction, Rectangle } from "cesium";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { useGeocodeSearch } from "../hooks/use-geocode-search";
import { clampBboxSpan } from "../lib/clamp-bbox";
import { EASE_OUT_EXPO, STAGGER_LIST } from "@/lib/motion";
import type { GeocodeResult } from "../types";

const DEBOUNCE_MS = 400;
const DEFAULT_FLY_HEIGHT_M = 80_000;
const FLY_DURATION_S = 2.8;

export function SearchBar() {
  const { cesiumRef, isCameraAnimatingRef } = useGlobeUi();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  const { data, isFetching } = useGeocodeSearch(debouncedQuery);
  const results = data?.results ?? [];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const flyTo = (result: GeocodeResult) => {
    const live = cesiumRef.current;
    if (!live) return;

    isCameraAnimatingRef.current = true;
    const onSettled = () => {
      isCameraAnimatingRef.current = false;
    };

    if (result.bbox) {
      const clamped = clampBboxSpan(result.bbox);
      live.camera.flyTo({
        destination: Rectangle.fromDegrees(clamped.west, clamped.south, clamped.east, clamped.north),
        duration: FLY_DURATION_S,
        easingFunction: EasingFunction.QUADRATIC_IN_OUT,
        complete: onSettled,
        cancel: onSettled,
      });
    } else {
      live.camera.flyTo({
        destination: Cartesian3.fromDegrees(result.longitude, result.latitude, DEFAULT_FLY_HEIGHT_M),
        duration: FLY_DURATION_S,
        easingFunction: EasingFunction.QUADRATIC_IN_OUT,
        complete: onSettled,
        cancel: onSettled,
      });
    }

    setQuery(result.name);
    setDebouncedQuery("");
    setOpen(false);
  };

  const clear = () => {
    setQuery("");
    setDebouncedQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="glass-panel flex items-center gap-2 rounded-full py-2 pl-4 pr-3 transition-colors focus-within:border-accent/50">
        <Search className="h-4 w-4 shrink-0 text-muted" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search a city or country..."
          aria-label="Search a city or country"
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
        />
        {isFetching && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-muted" />}
        {query && !isFetching && (
          <button
            onClick={clear}
            aria-label="Clear search"
            title="Clear search"
            className="shrink-0 text-muted transition-colors hover:text-foreground active:scale-90"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && debouncedQuery.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
            className="glass-panel-elevated absolute left-0 right-0 top-11 z-30 max-h-80 overflow-y-auto rounded-2xl p-2 shadow-2xl"
          >
            {results.length === 0 && !isFetching && (
              <p className="px-2 py-3 text-center text-xs text-muted">No places found</p>
            )}
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={STAGGER_LIST.container}
              className="flex flex-col gap-0.5"
            >
              {results.map((result) => (
                <motion.li key={result.id} variants={STAGGER_LIST.item}>
                  <button
                    onClick={() => flyTo(result)}
                    className="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-surface-elevated active:scale-[0.99]"
                  >
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                    <span className="flex flex-col">
                      <span className="text-foreground">{result.name}</span>
                      <span className="text-xs text-muted">{result.displayName}</span>
                    </span>
                  </button>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
