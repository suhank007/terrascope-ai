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
        className="glass-panel flex items-center gap-2 rounded-full py-3 pl-4 pr-5 text-accent shadow-xl"
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        <span className="text-sm font-medium">{open ? "Close" : "Ask AI"}</span>
      </motion.button>
    </div>
  );
}
