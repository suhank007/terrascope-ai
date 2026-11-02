"use client";

import { useReducedMotion } from "framer-motion";

/**
 * Full-bleed Earth loop behind the hero. It is atmosphere, not content: muted,
 * dimmed and faded into the page so the headline keeps the contrast. People who
 * ask for reduced motion get the still frame and no playback.
 */
export function HeroVideo() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      {reduce ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/video/hero-poster.jpg" alt="" className="h-full w-full object-cover opacity-40" />
      ) : (
        <video autoPlay muted loop playsInline preload="metadata" poster="/video/hero-poster.jpg" className="h-full w-full object-cover opacity-40">
          <source src="/video/hero.mp4" type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
    </div>
  );
}
