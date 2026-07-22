"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

interface PersistedSettings {
  autoRotate: boolean;
}

const STORAGE_KEY = "terrascope-demo-settings";
const DEFAULT_SETTINGS: PersistedSettings = { autoRotate: true };

function loadSettings(): PersistedSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<PersistedSettings>;
    return { autoRotate: typeof parsed.autoRotate === "boolean" ? parsed.autoRotate : DEFAULT_SETTINGS.autoRotate };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

interface DemoModeContextValue {
  /** Always true when this context is present — lets shared components do `demo?.isDemoMode`. */
  isDemoMode: true;
  /** Persisted presenter preference — the toolbar's Auto Rotate toggle reads/writes this. */
  autoRotate: boolean;
  setAutoRotate: (value: boolean) => void;
  /** Ephemeral, guided-demo-only override. Non-null while the script is
   *  actively driving rotation, so its own choreography never overwrites
   *  the persisted preference above. Consumers should read
   *  `guidedRotateOverride ?? autoRotate` as the effective value. */
  guidedRotateOverride: boolean | null;
  setGuidedRotateOverride: (value: boolean | null) => void;
  /** "Only the globe remains" — the toolbar's Hide UI/Show UI toggle and the
   *  Demo Overlay are the same mechanism: hides the main HUD and side panel,
   *  and shrinks the toolbar itself to a small always-reachable restore tab. */
  uiHidden: boolean;
  setUiHidden: (value: boolean) => void;
  isGuidedDemoRunning: boolean;
  /** Invalidates any in-flight guided-demo run and marks a new one current. Returns the new run id. */
  startGuidedDemoRun: () => number;
  /** Invalidates any in-flight run without starting a new one. */
  stopGuidedDemo: () => void;
  /** A running step should call this before/after each await to know whether it's been superseded. */
  isRunCurrent: (id: number) => boolean;
}

const DemoModeContext = createContext<DemoModeContextValue | null>(null);

export function DemoModeProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadSettings);
  const [autoRotate, setAutoRotate] = useState(initial.autoRotate);
  const [guidedRotateOverride, setGuidedRotateOverride] = useState<boolean | null>(null);
  const [uiHidden, setUiHidden] = useState(false);
  const [isGuidedDemoRunning, setGuidedDemoRunning] = useState(false);
  const runIdRef = useRef(0);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ autoRotate }));
    } catch {
      // Private browsing / storage full — the demo still works, it just won't remember next time.
    }
  }, [autoRotate]);

  const startGuidedDemoRun = useCallback(() => {
    runIdRef.current += 1;
    setGuidedDemoRunning(true);
    setGuidedRotateOverride(null);
    return runIdRef.current;
  }, []);

  const stopGuidedDemo = useCallback(() => {
    runIdRef.current += 1;
    setGuidedDemoRunning(false);
    setGuidedRotateOverride(null);
  }, []);

  const isRunCurrent = useCallback((id: number) => runIdRef.current === id, []);

  return (
    <DemoModeContext.Provider
      value={{
        isDemoMode: true,
        autoRotate,
        setAutoRotate,
        guidedRotateOverride,
        setGuidedRotateOverride,
        uiHidden,
        setUiHidden,
        isGuidedDemoRunning,
        startGuidedDemoRun,
        stopGuidedDemo,
        isRunCurrent,
      }}
    >
      {children}
    </DemoModeContext.Provider>
  );
}

/** For demo-only components — throws if rendered outside DemoModeProvider, same contract as useGlobeUi. */
export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) throw new Error("useDemoMode must be used within DemoModeProvider");
  return ctx;
}

/** For shared/production components that only need to *check* whether they're in demo mode. */
export function useDemoModeOptional() {
  return useContext(DemoModeContext);
}
