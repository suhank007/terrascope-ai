"use client";

import { useCallback, useState } from "react";
import type { CopilotChatResponse, CopilotMessage } from "../types";

export function useCopilotChat() {
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notConfigured, setNotConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const nextMessages: CopilotMessage[] = [...messages, { role: "user", content: trimmed }];
      setMessages(nextMessages);
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/copilot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: nextMessages }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error ?? "Copilot request failed");
        }

        const data: CopilotChatResponse = await res.json();
        if (!data.configured) {
          setNotConfigured(true);
          return;
        }

        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  return { messages, sendMessage, isLoading, notConfigured, error };
}
