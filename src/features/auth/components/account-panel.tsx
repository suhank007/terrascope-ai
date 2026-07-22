"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, LogOut, Save, Trash2, User } from "lucide-react";
import { useAuth } from "../hooks/use-auth";
import { createClient } from "@/lib/supabase/client";
import { useGlobeUi } from "@/features/globe/context/globe-ui-context";
import { useCreateSavedView, useDeleteSavedView, useSavedViews } from "@/features/saved-views/hooks/use-saved-views";
import { captureCameraState, flyToCameraState } from "@/features/saved-views/lib/camera-state";
import { formatRelativeTime } from "@/lib/format";
import { EASE_OUT_EXPO } from "@/lib/motion";
import type { SavedView } from "@/features/saved-views/types";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setStatus("error");
      setError(error.message);
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <p className="px-2 py-6 text-center text-sm text-muted">
        Check <span className="text-foreground">{email}</span> for a sign-in link.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-2">
      <p className="px-1 pb-1 text-xs text-muted">Sign in to save your custom globe views.</p>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="rounded-lg border border-border bg-surface-elevated/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent/50"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-lg bg-accent-soft py-2 text-sm font-medium text-accent transition hover:opacity-90 disabled:opacity-50 disabled:active:scale-100 active:scale-[0.98]"
      >
        {status === "sending" ? "Sending…" : "Send magic link"}
      </button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </form>
  );
}

function SaveCurrentView() {
  const { layers, selectedAirlines, cesiumRef } = useGlobeUi();
  const [name, setName] = useState("");
  const createView = useCreateSavedView();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!cesiumRef.current || !name.trim()) return;

    createView.mutate(
      {
        name: name.trim(),
        camera: captureCameraState(cesiumRef.current.camera),
        layers,
        selectedAirlines: Array.from(selectedAirlines),
      },
      { onSuccess: () => setName("") }
    );
  }

  return (
    <form onSubmit={handleSave} className="flex items-center gap-1.5 px-2 py-1.5">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name this view…"
        className="min-w-0 flex-1 rounded-lg border border-border bg-surface-elevated/40 px-2.5 py-1.5 text-xs text-foreground outline-none placeholder:text-muted focus:border-accent/50"
      />
      <button
        type="submit"
        disabled={!name.trim() || createView.isPending}
        aria-label="Save current view"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent transition-transform disabled:opacity-40 disabled:active:scale-100 active:scale-90"
      >
        {createView.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
      </button>
    </form>
  );
}

function SavedViewRow({ view }: { view: SavedView }) {
  const { setAllLayers, setAirlineFilter, cesiumRef, isCameraAnimatingRef } = useGlobeUi();
  const deleteView = useDeleteSavedView();

  function restore() {
    setAllLayers(view.layers);
    setAirlineFilter(new Set(view.selectedAirlines));
    if (cesiumRef.current) {
      isCameraAnimatingRef.current = true;
      flyToCameraState(cesiumRef.current.camera, view.camera, () => {
        isCameraAnimatingRef.current = false;
      });
    }
  }

  return (
    <li className="flex items-center gap-1 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-elevated">
      <button onClick={restore} className="min-w-0 flex-1 text-left active:scale-[0.99]">
        <span className="block truncate text-sm text-foreground">{view.name}</span>
        <span className="block text-[10px] text-muted">{formatRelativeTime(view.createdAt)}</span>
      </button>
      <button
        onClick={() => deleteView.mutate(view.id)}
        aria-label={`Delete ${view.name}`}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-danger active:scale-90"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}

function SignedInView() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useSavedViews(true);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="truncate text-xs text-muted">{user?.email}</span>
        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-foreground active:scale-95"
        >
          <LogOut className="h-3 w-3" /> Sign out
        </button>
      </div>

      <div className="my-1 border-t border-border" />

      <SaveCurrentView />

      <div className="my-1 border-t border-border" />

      <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted">Saved views</p>
      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
        </div>
      ) : isError ? (
        <p className="px-2 py-4 text-center text-xs text-danger">
          Couldn&apos;t load saved views — the database table may not be set up yet.
        </p>
      ) : !data || data.views.length === 0 ? (
        <p className="px-2 py-4 text-center text-xs text-muted">No saved views yet.</p>
      ) : (
        <ul className="flex max-h-52 flex-col gap-0.5 overflow-y-auto">
          {data.views.map((view) => (
            <SavedViewRow key={view.id} view={view} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function AccountPanel() {
  const { user, loading } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
      className="glass-panel-elevated absolute right-0 top-11 z-30 w-72 overflow-hidden rounded-2xl p-2 shadow-2xl"
    >
      <div className="flex items-center gap-2 px-2 py-1.5">
        <User className="h-3.5 w-3.5 text-accent" />
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Account</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-xs text-muted">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
        </div>
      ) : user ? (
        <SignedInView />
      ) : (
        <SignInForm />
      )}
    </motion.div>
  );
}
