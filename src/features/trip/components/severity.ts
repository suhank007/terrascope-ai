import { AlertTriangle, OctagonAlert, ShieldAlert, ShieldCheck, type LucideIcon } from "lucide-react";
import type { Severity } from "../types";

interface SeverityStyle {
  /** Spoken and shown, so colour is never the only signal. */
  label: string;
  icon: LucideIcon;
  text: string;
  bg: string;
  border: string;
  dot: string;
}

export const SEVERITY: Record<Severity, SeverityStyle> = {
  none: { label: "No flags", icon: ShieldCheck, text: "text-accent", bg: "bg-accent-soft", border: "border-accent/30", dot: "bg-accent" },
  caution: { label: "Caution", icon: AlertTriangle, text: "text-alert", bg: "bg-alert/10", border: "border-alert/30", dot: "bg-alert" },
  high: { label: "High risk", icon: ShieldAlert, text: "text-danger", bg: "bg-danger/10", border: "border-danger/30", dot: "bg-danger" },
  critical: { label: "Do not travel", icon: OctagonAlert, text: "text-danger", bg: "bg-danger/15", border: "border-danger/60", dot: "bg-danger" },
};
