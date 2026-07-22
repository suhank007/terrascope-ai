# Product

## Register

product

## Users

Two overlapping audiences: (1) visitors evaluating the founder's work — recruiters, clients, other engineers — who spend a few minutes exploring before forming an opinion; (2) anyone who lands on the live demo and just wants to poke at a 3D globe with real data. Neither audience reads documentation first. The UI itself has to communicate "this is a real, considered product" within seconds, since the app's whole purpose is to demonstrate craft, not just function.

## Product Purpose

TerraScope AI is a real-time global intelligence platform: a 3D globe showing live earthquakes, weather, flights, wildfires, and air quality, plus an AI copilot that answers questions against that live data. It exists as a portfolio piece explicitly built to feel like a shipped commercial product rather than a tutorial project — see README.md ("build something that looks and feels like a real commercial product, not a tutorial project or a template"). Success is a visitor's first impression matching that ambition: polished, intentional, calm, not a raw developer tool with data bolted onto a map.

## Brand Personality

Confident, precise, quiet. Three words: **calm, considered, capable.** Reference lane is tech-minimal product design, not enterprise-dashboard density and not consumer-playful. Explicit references given directly by the founder, twice, independently: Palantir / Stripe / Linear (original build direction) and Apple / Stripe / Vercel / Linear (this polish pass, framed as "would Apple ship this?"). Common thread across all of them: restrained color, generous negative space, typography doing the hierarchy work instead of decoration, motion that's subtle and purposeful rather than decorative.

## Anti-references

Explicitly named by the founder: "anything that feels like a developer tool." In practice this means: dense unstyled data dumps, inconsistent ad-hoc spacing, mismatched icon weights/sizes, harsh or default browser-native form controls, visual noise from too many simultaneous accents, anything that reads as "admin panel" rather than "product."

## Design Principles

1. **Restraint over decoration.** One accent color, used deliberately, not sprinkled. Hierarchy comes from type scale, weight, and spacing — not extra colors or borders.
2. **Consistency is the polish.** The same icon size, the same card radius, the same spacing rhythm, everywhere, is what actually reads as "considered" — more than any single flourish.
3. **Calm density.** This app already shows a lot of live, real-time data (five sources plus an AI copilot). Polish here means giving it room to breathe, not adding chrome.
4. **Data stays legible over the globe.** Every HUD element sits on top of a live, moving, dark 3D scene — contrast and glass-panel treatment have to hold up against arbitrary imagery behind them, not just a flat background.
5. **No functional changes.** This document and the polish pass it guides are visual/UX only — component behavior, data flow, and architecture are out of scope by explicit instruction.

## Accessibility & Inclusion

Solid baseline, not a formal compliance target: adequate contrast, visible keyboard focus states, keyboard-operable interactive controls, respect `prefers-reduced-motion`. No formal WCAG level is being audited against for this pass.
