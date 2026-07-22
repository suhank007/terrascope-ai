"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { KeyRound, Loader2, Send, Sparkles, X } from "lucide-react";
import { useCopilotChat } from "../hooks/use-copilot-chat";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Summarize today's strongest earthquakes",
  "What's the air quality in Beijing right now?",
  "Are there any active wildfires?",
];

export function CopilotPanel({ onClose }: { onClose: () => void }) {
  const { messages, sendMessage, isLoading, notConfigured, error } = useCopilotChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const submit = (text: string) => {
    setInput("");
    void sendMessage(text);
  };

  return (
    <motion.div
      role="dialog"
      aria-label="AI Copilot"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="glass-panel-elevated flex h-[28rem] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium text-foreground">AI Copilot</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close copilot"
          className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {notConfigured ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <KeyRound className="h-6 w-6 text-alert" />
            <p className="text-sm text-foreground">Copilot isn&apos;t configured yet</p>
            <p className="text-xs text-muted">
              Add <code className="rounded bg-surface-elevated px-1 py-0.5">ANTHROPIC_API_KEY</code> to{" "}
              <code className="rounded bg-surface-elevated px-1 py-0.5">.env.local</code> to enable it.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col gap-2 py-4">
            <p className="text-sm text-muted">Ask about live conditions anywhere on the globe.</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => submit(s)}
                className="rounded-lg border border-border bg-surface-elevated/40 px-3 py-2 text-left text-xs text-muted transition-colors hover:border-accent/40 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                m.role === "user"
                  ? "ml-auto bg-accent-soft text-foreground"
                  : "mr-auto border border-border bg-surface-elevated/50 text-foreground"
              )}
            >
              {m.content}
            </div>
          ))
        )}

        {isLoading && (
          <div className="mr-auto flex items-center gap-2 text-xs text-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
          </div>
        )}
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>

      {!notConfigured && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(input);
          }}
          className="flex items-center gap-2 border-t border-border px-4 py-3"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the copilot…"
            disabled={isLoading}
            className="flex-1 rounded-full border border-border bg-surface-elevated/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent/50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            aria-label="Send"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent transition-opacity disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      )}
    </motion.div>
  );
}
