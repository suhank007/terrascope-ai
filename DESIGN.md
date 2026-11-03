---
name: TerraScope AI
description: Travel risk briefs and a live map, built from free public data. Light, flat and plain, in the manner of a flight-search site.
colors:
  background: "#ffffff"
  surface: "#f5f7fa"
  surface-elevated: "#ebeff5"
  foreground: "#0b1d33"
  muted: "#55657a"
  border: "rgba(11, 29, 51, 0.12)"
  accent: "#0062e3"
  accent-soft: "rgba(0, 98, 227, 0.08)"
  accent-strong: "#004db3"
  success: "#0a7d4e"
  alert: "#b25e00"
  danger: "#c4262e"
typography:
  body:
    fontFamily: "var(--font-geist-sans)"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "var(--font-geist-sans)"
    fontSize: "14px"
    fontWeight: 500
  data:
    fontFamily: "var(--font-geist-mono)"
    fontSize: "14px"
    fontWeight: 500
rounded:
  pill: "9999px"
  md: "8px"
  lg: "12px"
  xl: "16px"
---

# Design System: TerraScope AI

## 1. Direction

Clean and ordinary on purpose: a white page, navy text, one blue, big readable type, real photography at the top and nothing fancy below it. The reference is a flight-search site (Skyscanner, Google Flights), not a dashboard. The earlier dark, glowing, 3D-tile look read as "made by AI" and was removed.

## 2. Color

- **White** (`--background`) is the page. **Surface** (`--surface`) is only for inputs, chips and a quiet band such as "What it checks". Panels are white with a hairline border and the faintest shadow (`.dock-panel`).
- **Blue** (`--accent`, `#0062e3`) means "you can act on this": links, the primary button, the selected tab, focus rings. It is the only brand color.
- **Status colors never double as brand.** Green (`--success`) is all-clear, amber (`--alert`) is caution, red (`--danger`) is high risk or a delay. Each is always paired with a word or icon, never color alone.
- Data colors (earthquake magnitude, AQI bands, wildfire confidence, temperature, aircraft altitude) use darker, text-safe hues so they read on white as well as on the map.
- No gradients as decoration, no glow, no tinted squares behind icons, no neon.

## 3. Type

Geist Sans at 16px body, 14px for labels, headings in semibold with tight tracking (`text-2xl` to `text-5xl`). Geist Mono for codes and numbers (IATA, magnitudes, AQI). Nothing below 12px, and 14px or more for anything read.

## 4. Layout and surfaces

- **Landing (`/`):** a sticky white top bar, a photo hero with the search card overlapping its bottom edge (tabs: Trip Brief, Flight, Airport), a live airport board, destination photo cards, a plain "What it checks" band, and the honest "What it doesn't know yet" list.
- **Travel pages (`/trip`, `/flights`, `/airports`):** the same top bar (brand, three tabs with a sliding underline, live globe), then a heading and white cards.
- **Globe (`/globe`):** docked white panels beside the map on desktop, a bottom sheet on phones. The map is Esri World Street Map on a pale background with no starfield or atmosphere. Anything floating over the map uses `.glass-panel` (white at 90%, hairline border).
- Photographs are illustrations and are labelled as such. Short loop clips are drawn explanations, captioned "Not live data".

## 5. Motion

Subtle and functional: a fade-up on entrance, a sliding tab indicator, a gentle image zoom on card hover, count and list reveals. Everything honours `prefers-reduced-motion` through `MotionConfig reducedMotion="user"`; the hero and clips fall back to still frames.

## 6. Rules

- Tap targets are at least 44px on touch.
- One accent. Status colors only mean status.
- Copy is plain, with no em dashes. Never show a failed or unconfigured feed as "none" or "all clear".
- Prefer open sections and lists over nested cards.
