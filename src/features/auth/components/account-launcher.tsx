"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { User } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { AccountPanel } from "./account-panel";
import { cn } from "@/lib/utils";

export function AccountLauncher() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Account"
        title="Account"
        className={cn(
          "glass-panel flex h-9 w-9 items-center justify-center rounded-full transition-colors active:scale-90",
          user ? "text-accent" : "text-muted hover:text-foreground"
        )}
      >
        <User className="h-4 w-4" />
      </button>

      <AnimatePresence>{open && <AccountPanel />}</AnimatePresence>
    </div>
  );
}
