"use client";

import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type LoopKind = "routes" | "delay" | "quake" | "air";

/**
 * A short illustrative loop with an honest caption: these are drawn
 * explanations of what a feature shows, never live data. People who ask for
 * reduced motion get the still frame.
 */
export function LoopClip({ kind, caption, className }: { kind: LoopKind; caption: string; className?: string }) {
  const reduce = useReducedMotion();
  const poster = `/video/loop-${kind}.jpg`;

  return (
    <figure className={cn("overflow-hidden rounded-2xl border border-border bg-surface", className)}>
      {reduce ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="aspect-video w-full object-cover" />
      ) : (
        <video aria-hidden autoPlay muted loop playsInline preload="metadata" poster={poster} className="aspect-video w-full object-cover">
          <source src={`/video/loop-${kind}.mp4`} type="video/mp4" />
        </video>
      )}
      <figcaption className="border-t border-border px-4 py-2.5 text-xs text-muted">{caption}</figcaption>
    </figure>
  );
}
