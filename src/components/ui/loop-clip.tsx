"use client";

import { useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export type LoopKind = "routes" | "delay" | "quake" | "air";

/**
 * A short illustrative loop with an honest caption: these are drawn
 * explanations of what a feature shows, never live data. It can be paused,
 * and people who ask for reduced motion get the still frame with no playback.
 */
export function LoopClip({ kind, caption, className }: { kind: LoopKind; caption: string; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const poster = `/video/loop-${kind}.jpg`;

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <figure className={cn("overflow-hidden rounded-2xl border border-border bg-white shadow-[var(--shadow-card)]", className)}>
      {reduce ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" width={960} height={540} className="aspect-video w-full object-cover" />
      ) : (
        <video ref={ref} aria-hidden autoPlay muted loop playsInline preload="metadata" poster={poster} className="aspect-video w-full object-cover">
          <source src={`/video/loop-${kind}.mp4`} type="video/mp4" />
        </video>
      )}
      <figcaption className="flex items-center justify-between gap-3 border-t border-border py-1 pl-4 pr-1 text-sm text-muted">
        <span>{caption}</span>
        {!reduce && (
          <button type="button" onClick={toggle} aria-label={playing ? "Pause animation" : "Play animation"} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-foreground">
            {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
          </button>
        )}
      </figcaption>
    </figure>
  );
}
