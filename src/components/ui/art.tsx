"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** The 3D renders in /public/art. Decorative: the label next to them always carries the meaning. */
export type ArtKind = "flight" | "city" | "hotel" | "quake" | "air" | "weather" | "fire" | "airport";

/**
 * A 3D icon that drifts slowly and tilts toward the pointer. Screen blending
 * drops the near-black render background into any dark surface, so it reads as
 * an object rather than a picture. MotionConfig turns the drift off for people
 * who ask the OS for reduced motion.
 */
export function Art({ kind, size = 64, float = true, className }: { kind: ArtKind; size?: number; float?: boolean; className?: string }) {
  return (
    <motion.span
      aria-hidden
      className={cn("inline-block shrink-0 select-none", className)}
      style={{ width: size, height: size }}
      animate={float ? { y: [0, -size * 0.06, 0] } : undefined}
      transition={float ? { duration: 5 + (kind.length % 3), repeat: Infinity, ease: "easeInOut" } : undefined}
      whileHover={{ scale: 1.08, rotate: -3, transition: { type: "spring", stiffness: 320, damping: 22 } }}
    >
      <span className="block h-full w-full overflow-hidden [mask-image:radial-gradient(circle_at_center,black_66%,transparent_82%)]">
        <Image src={`/art/${kind}.jpg`} alt="" width={size * 2} height={size * 2} sizes={`${size}px`} className="h-full w-full scale-[1.15] object-cover mix-blend-screen contrast-110" draggable={false} />
      </span>
    </motion.span>
  );
}
