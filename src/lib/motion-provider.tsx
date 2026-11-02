"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

/** Every framer-motion animation honours the OS "reduce motion" setting: transforms are skipped, opacity still fades. */
export function AppMotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
