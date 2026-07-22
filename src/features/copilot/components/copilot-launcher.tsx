"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { CopilotPanel } from "./copilot-panel";
import { EASE_OUT_EXPO } from "@/lib/motion";

export function CopilotLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-end gap-3">
      <AnimatePresence>{open && <CopilotPanel onClose={() => setOpen(false)} />}</AnimatePresence>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close AI Copilot" : "Open AI Copilot"}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.94, y: 0 }}
        transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
        className="flex items-center gap-2 rounded-full bg-accent py-3 pl-4 pr-5 text-background shadow-xl hover:shadow-2xl"
      >
        {open ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        <span className="text-sm font-medium">{open ? "Close" : "Ask AI"}</span>
      </motion.button>
    </div>
  );
}
