"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";

/** A number that rolls up to its value the first time it scrolls into view. */
export function CountUp({ to, duration = 1.6, format }: { to: number; duration?: number; format?: (value: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const value = useMotionValue(reduce ? to : 0);
  const text = useTransform(value, (v) => (format ? format(v) : Math.round(v).toLocaleString()));

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(value, to, { duration, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [inView, reduce, to, duration, value]);

  return <motion.span ref={ref}>{text}</motion.span>;
}
