"use client";

import { Component, type ReactNode } from "react";
import { GlobeUnavailable } from "./globe-unavailable";

/** Catches a failure while the Cesium viewer starts (a context that exists but won't initialise) and shows the fallback instead of a crash. */
export class GlobeErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Globe failed to start:", error);
  }

  render() {
    if (this.state.failed) return <GlobeUnavailable onRetry={() => this.setState({ failed: false })} />;
    return this.props.children;
  }
}
