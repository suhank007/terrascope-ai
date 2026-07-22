"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { CopilotPanel } from "./copilot-panel";

export function CopilotLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-end gap-3">
      <AnimatePresence>{open && <CopilotPanel onClose={() => setOpen(false)} />}</AnimatePresence>

      <motion.button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close AI Copilot" : "Open AI Copilot"}
        whileTap={{ scale: 0.94 }}
        className="flex items-center gap-2 rounded-full bg-accent py-3 pl-4 pr-5 text-background shadow-xl transition-colors hover:bg-accent-strong"
      >
        {open ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        <span className="text-sm font-medium">{open ? "Close" : "Ask AI"}</span>
      </motion.button>
    </div>
  );
}
