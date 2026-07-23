"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The one small-pill treatment for every transient, bottom-center status
 * message on the globe (zoom hints, config hints, empty-data hints). One
 * shared component so they can never visually drift from each other.
 */
export function StatusHint({
  show,
  icon: Icon,
  iconClassName,
  children,
}: {
  show: boolean;
  icon: LucideIcon;
  iconClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="glass-panel pointer-events-none flex items-center gap-2 rounded-full px-4 py-2 text-xs text-muted"
        >
          <Icon className={cn("h-3.5 w-3.5 text-accent", iconClassName)} />
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
