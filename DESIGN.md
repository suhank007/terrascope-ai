---
name: TerraScope AI
description: Real-time global intelligence platform — 3D globe, live earthquakes/weather/flights/wildfires/air quality, AI copilot
colors:
  background: "#05070a"
  surface: "#0c0f14"
  surface-elevated: "#12161e"
  foreground: "#eef1f5"
  muted: "#8891a1"
  border: "rgba(238, 241, 245, 0.09)"
  accent: "#35e0c8"
  accent-soft: "rgba(53, 224, 200, 0.12)"
  accent-strong: "#7df9e6"
  alert: "#f5a623"
  danger: "#f2545b"
typography:
  body:
    fontFamily: "var(--font-geist-sans)"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "var(--font-geist-sans)"
    fontSize: "12px"
    fontWeight: 500
    letterSpacing: "0.02em"
  data:
    fontFamily: "var(--font-geist-mono)"
    fontSize: "13px"
    fontWeight: 500
rounded:
  pill: "9999px"
  md: "8px"
  lg: "12px"
  xl: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  panel-glass:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  panel-glass-elevated:
    backgroundColor: "{colors.surface-elevated}"
    rounded: "{rounded.xl}"
    padding: "8px"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.background}"
    rounded: "{rounded.pill}"
  button-primary-hover:
    backgroundColor: "{colors.accent-strong}"
---

# Design System: TerraScope AI

## 1. Overview

**Creative North Star: "The Situation Room"**

TerraScope AI is a calm command center, not a decorated app. A live, moving 3D globe fills the entire screen; every UI element is a translucent glass panel floating above it, never competing with the data underneath. The palette is almost entirely neutral — near-black surfaces, off-white text — with exactly one signal color, teal, reserved for the things that genuinely need attention: an active state, a live confidence score, the one button that matters most on a given screen. This is the aesthetic of a serious monitoring instrument (think air-traffic control, not a consumer dashboard): information-dense by necessity, but never visually loud.

This system explicitly rejects the "developer tool" look: raw data dumps with no hierarchy, inconsistent spacing that makes a screen feel improvised, mismatched icon weights, and any UI chrome that draws attention to itself rather than the live data it's presenting.

**Key Characteristics:**
- Near-black glass panels over a live 3D scene, never a flat opaque background
- One accent color (teal, `#35e0c8`), used sparingly and only for meaning (active/live/selected), never decoration
- Every interactive surface is a pill or a soft-radius card — no sharp corners, no visible borders except a near-invisible 1px hairline
- Typography carries hierarchy through size and weight; color is reserved for state, not emphasis

## 2. Colors

A near-monochrome dark palette with a single accent, so the one color that does appear reads as meaningful rather than decorative.

### Primary
- **Situation Teal** (`#35e0c8`): the one accent. Used for active states, live/selected data, primary icons, and links. Never used decoratively (no gradients, no teal-on-teal layering).
- **Teal Soft** (`rgba(53, 224, 200, 0.12)`): the accent's tint, used only as a background fill behind accent-colored content (badges, active pills) — never as a border or standalone surface.
- **Teal Strong** (`#7df9e6`): hover/active state for anything already accent-colored. Never a resting-state color.

### Neutral
- **Void** (`#05070a`): page background — the globe's canvas sits directly on this.
- **Surface** (`#0c0f14`): base panel fill for the rare fully-opaque surface.
- **Surface Elevated** (`#12161e`): dropdowns, popovers, anything stacked above the base HUD layer.
- **Foreground** (`#eef1f5`): primary text. Never pure white.
- **Muted** (`#8891a1`): secondary text, labels, placeholder text, inactive icons.
- **Hairline Border** (`rgba(238, 241, 245, 0.09)`): the only border weight in the system. Nearly invisible at rest; its job is separation, not decoration.

### Semantic
- **Alert** (`#f5a623`): warnings, medium-severity states.
- **Danger** (`#f2545b`): high-severity alerts, destructive actions, high-magnitude/high-confidence data readings.

### Named Rules
**The One Signal Rule.** Teal is the only color that means "look here." If more than one element on screen is fighting for attention with color, the hierarchy has already failed — fix it with size and position, not a second accent.

## 3. Typography

**Body Font:** Geist Sans (`var(--font-geist-sans)`)
**Data/Mono Font:** Geist Mono (`var(--font-geist-mono)`), for coordinates, IDs, and other literal data values where digit alignment matters.

**Character:** Geist is neutral and technical without being cold — legible at the small sizes a HUD demands, with enough warmth to avoid feeling like a terminal.

### Hierarchy (current state — see Do's and Don'ts)
- **Title** (600 weight, 14–16px): panel/card headers, the app wordmark.
- **Body** (400 weight, 13–14px): primary content in side panels and lists.
- **Label** (400–500 weight, 12px, sentence case): form labels, metadata, muted supporting lines. Never uppercase, never tracked out.
- **Data** (500 weight, 13px, mono): numeric readings — coordinates, magnitudes, timestamps.


### Named Rules
**The No-Ad-Hoc-Sizing Rule.** Every text element maps to one of the four roles above (Title, Body, Label, Data). If a new size doesn't fit Title/Body/Label/Data, that's a sign the hierarchy needs a fifth role defined deliberately, not a one-off `text-[13px]`. There is no 10px role: anything that used to be one is Label (`text-xs`).

## 4. Elevation

Flat by design, not layered with shadows. Depth is conveyed by **glass translucency and blur**, not drop shadows — because every panel sits over a bright, moving, unpredictable 3D scene, and a shadow strong enough to read over arbitrary imagery would look heavy and dated. `backdrop-filter: blur(20px)` plus a translucent fill does the separation work that a shadow would do on a flat page.

### Shadow Vocabulary
- **Glass** (`background: rgba(12,15,20,0.6)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(238,241,245,0.08)`): the resting state for every floating HUD element.
- **Glass Elevated** (`background: rgba(18,22,30,0.72)`, same blur/border): anything stacked above the base layer — dropdowns, popovers, the expanded side panel.
- **Dropdown Shadow** (`shadow-2xl`, Tailwind default): the one place a true drop shadow is earned — content floating above other floating content needs one more cue of "this is on top."

### Named Rules
**The Blur-Not-Shadow Rule.** Depth over the globe comes from translucency and blur, never a dark drop shadow. A shadow-heavy panel over a bright ocean or a sunlit continent looks like a mistake, not a design choice.

## 5. Components

### Buttons
- **Shape:** full pill (`rounded-full`, `9999px`) for every standalone action button; `rounded-lg` (`8px`) only for items inside a list/dropdown.
- **Primary:** solid `accent` fill, `background` (near-black) text, `accent-strong` on hover — reserved for the single most important action on screen. Live example: the Copilot launcher — the one AI-powered, headline feature — is the only button in the HUD using this treatment. No other control should adopt it; adding a second solid-fill button dilutes the one-primary-action signal.
- **Secondary / Icon buttons (current default):** `glass-panel` background, `muted` icon/text at rest, `foreground` on hover — this is the dominant button style throughout the HUD today.
- **Icon-only circular buttons — two sizes only:** `h-9 w-9` container / `h-4 w-4` icon for standalone top-level HUD controls (bell, account, send); `h-7 w-7` container / `h-3.5 w-3.5` icon for compact row-level actions inside a list (save view, delete view). Never introduce a third size.
- **Hover / Focus:** color shift from `muted` → `foreground` (or `accent` when the button represents an active/toggleable state); transitions should be quick (150–200ms) and never bounce. Keyboard focus on every interactive element shows a `2px` solid `ring` outline (`:focus-visible`, `outline-offset: 2px`) — the only outline styling in the system, applied globally rather than per-component.

### Icon Sizing
One scale, three tiers, applied by role rather than by feel:
- **xs (`h-3 w-3`, 12px):** inline, directly preceding a Label or Data-role text run — stat-card `dt` icons, a timestamp icon.
- **sm (`h-3.5 w-3.5`, 14px):** the default — most standalone icons: layer toggles, dropdown list-row icons, compact button icons.
- **md (`h-4 w-4`, 16px):** header-level — the wordmark icon, panel-header icons, close buttons, and every `h-9 w-9` standalone icon button.

No icon in the HUD should render above `h-4 w-4`; the one-off larger icon that used to sit on the Copilot launcher was normalized to `md` when that button moved to the solid Primary treatment, since fill and color now carry its emphasis instead of size.

### Cards / Panels
- **Corner style:** `rounded-2xl` (16px) for elevated dropdown/popover panels, `rounded-lg` (8px) for compact list rows inside them.
- **Background:** `glass-panel` / `glass-panel-elevated` (see Elevation) — almost nothing in this UI is a flat opaque card.
- **Border:** the single hairline border only; no additional colored borders or side-stripes.
- **Internal padding:** every anchored dropdown panel (alerts, account, airline filter, search results, map legend) uses `p-2` (`8px`) outer padding with `px-2 py-1.5`–`py-2` list rows — this pass aligned the one outlier (map legend was `p-3`). The larger, one-off entity side panel and Copilot chat panel use `16px`–`24px` since they're a different scale of surface, not a small anchored menu.

### Data Markers (signature component)
Points and billboards on the globe itself (earthquakes, weather, flights, wildfires) use small filled circles or icons color-coded per the [map legend](src/features/globe/components/map-legend.tsx), each with a subtle black outline for contrast against arbitrary terrain/ocean colors underneath. This is the one place multiple colors are legitimate at once, because each layer's color scale is a distinct, self-contained legend — not competing accents on the same UI chrome.

### Navigation (HUD)
Top bar and bottom-corner widgets are all `glass-panel` pills or panels, floating over the globe rather than docked to an opaque bar. No traditional nav — the globe itself is the canvas; HUD elements are overlays, not a frame around it.

### Status System
Three honest states, not one static "LIVE" badge that never changes: **Connecting** (muted dot, no pulse — first load, no data yet), **Live** (accent dot, slow breathing pulse via `animate-pulse-ring`), **Updating** (accent dot, `animate-pulse` — a background refetch is in flight). Lives in the [brand mark](src/features/globe/components/brand-mark.tsx) next to the wordmark, computed by `useLiveStatus`. The dot animation is the only place in the system two different pulse rhythms are intentionally used side by side — everywhere else, one animation per purpose.

### Loading
Skeletons are shaped like their eventual content (a circle where the icon will be, bars where text will be), never a generic spinner-in-a-box. Each shape gets `.skeleton-shimmer` — a light-band sweep clipped to that shape — instead of a whole-block opacity pulse, which reads as "waiting" rather than "loading." Reserve a plain centered spinner for places too small or transient to be worth a shaped skeleton (inline search-as-you-type, a send button mid-request).

### Empty States
Every "zero results" state gets its own considered sentence, never a bare "No data." Two tiers: a reassuring one for an empty-but-healthy result ("No active wildfire alerts detected right now" — `ShieldCheck` icon, default muted tone) and a neutral instructional one for "nothing to show yet, here's why" ("Zoom in to see live flights"). Both route through the shared [StatusHint](src/features/globe/components/status-hint.tsx) component so they never drift from each other visually.

## 5b. Workspace layout (xl and up, 1280px+)

At 1280px and wider the app is a docked **mission-control workspace** rather than a floating HUD: top bar (brand, ⌘K search, source health, alerts, account), a left rail (Data layers with live counts and switches, then Filters), the globe in the centre, and a right **Signal Explorer** dock. Below 1280px the original full-bleed globe with floating HUD is unchanged, and `/demo` keeps the floating HUD at every width. One globe is mounted either way; only its container changes.

- **Docked panels are opaque** (`.dock-panel`: `--surface` + hairline border, no blur). Glass (`.glass-panel*`) is reserved for anything that floats *over* the globe, and every overlay on the globe is a glass pill so it stays legible over bright map tiles.
- **Explorer is the detail view too.** Selecting a signal (from the list or by clicking the globe) swaps the dock to that signal's detail with a back arrow and Esc; nothing floats over the globe on desktop.
- **Every list has four states**: loading skeleton, error with retry, empty (with a way out, e.g. "Show all magnitudes"), and layer-hidden (with a one-click "Show").
- **Home view** is `HOME_VIEW` in `workspace/hooks/use-fly-to.ts`; the reset control and the first-load framing both use it.

### Below 1280px: map plus bottom sheet

Phones and tablets keep the full-bleed globe. The chrome is a compact top bar (identity, alerts, account, then search at 16px so iOS doesn't zoom on focus) and a **bottom sheet** that carries the same Signal Explorer. The sheet has three snap points (peek, half, full); drag the handle, tap it, or tap a layer tab. A selection lifts a collapsed sheet to half and shows the detail with a back button. Half stays under the viewport midpoint because that is where the camera lands a flown-to signal. The explorer is compacted here (source and update time fold into one line; filters become a header icon), the top bar fades out at full height, and every touch target is at least 40px. The old floating HUD (`HudOverlay`) now only serves `/demo`.

## 5c. The clean-UI rules (travel pages and the workspace)

Written after an audit against Impeccable's product register. They apply to every screen.

- **Two filled surfaces per page, at most.** On a travel page that is the answer (verdict, outlook or flight status) and the planner or search. Everything else is an **open section**: a heading, content, and a hairline above it. A section is never a card.
- **No nested boxes.** Facts are a property list (`Facts`: label left, value right, hairline between rows). Links are rows (`LinkList`). Never a bordered tile inside a panel.
- **No decorative glass.** Blur is for what floats over the globe (overlays, popovers, the mobile search). On a solid page, inputs and panels are solid.
- **One answer first, then detail.** The verdict states the call and lists every reason with its source, and says what it couldn't check. Detail follows in reading order, with a sticky "On this page" list on wide screens and a chip bar on phones.
- **Type is sentence case.** Four roles: Title (16 to 28), Body (14), Label (12), Data (mono, for codes and numbers only). No 10px text and no all-caps eyebrows.
- **Colour is meaning.** Severity colour appears on the verdict, a flagged row, or a status word with a dot. It is never the only signal: a word always accompanies it.
- **Phones put the answer on the first screen.** Planning controls fold to one line once a trip exists.
- **Copy has no em dashes.** Use commas, colons or full stops. Empty values read "Not reported" or "n/a".

## 5d. Front page (brand register)

The front page at `/` is a **brand** surface, so it deliberately breaks the product rules above: full-bleed black, a starfield, a floating glass nav and a travelling-edge CTA, in the red-noir direction. It still follows the same honesty rules.

- **Two signals, not one.** Red (`--noir`, `#ef233c`) means alert, threat or the primary action. Teal (`--accent`) keeps meaning all-clear and live, so the front page and the app read as one system.
- **Real where it can be, labelled where it can't.** The hero globe, the Delays board, the Threats map and the feature counts run on live feeds. The Track and Plan tabs are examples and say so. No invented quotes, logos or prices.
- **One container width** (`max-w-6xl`) for every section, balanced headings, and sentence-case copy with no em dashes.
- **Motion carries meaning.** Entrance reveals, a route drawing in, counts rolling up, rings pulsing on alerts. All of it stops under `prefers-reduced-motion`.

## 6. Do's and Don'ts

### Do:
- **Do** keep teal as the only accent color anywhere in the HUD (per PRODUCT.md and the confirmed direction for this pass).
- **Do** use `glass-panel` / `glass-panel-elevated` with blur for every floating HUD surface — never an opaque flat card over the globe.
- **Do** keep every border at the single hairline weight (`rgba(238,241,245,0.09)`); no heavier or colored borders.
- **Do** use full pills for standalone buttons and `rounded-lg`/`rounded-2xl` for nested content, consistently.

### Don't:
- **Don't** let this feel like a developer tool — no raw data dumps without hierarchy, no inconsistent ad-hoc spacing, no mismatched icon sizes (direct anti-reference from PRODUCT.md).
- **Don't** add a second accent color, even for "just this one badge." Route new meaning through the existing Alert/Danger semantic colors or through size/weight instead.
- **Don't** use drop shadows as the primary depth cue on any panel that sits over the globe — blur and translucency only (see the Blur-Not-Shadow Rule). Exception: the one solid-fill Primary button (Copilot launcher) keeps a resting shadow, because it's the one HUD surface that isn't glass and has no blur to separate it from the scene.
- **Don't** use a border-left/border-right colored stripe as an accent on any card, list item, or alert.
- **Don't** use gradient text or glassmorphism as decoration — the existing glass treatment is functional (separation from a moving scene), not a visual flourish to add elsewhere.
- **Don't** reach for an arbitrary Tailwind value (`text-[10px]`, `text-[11px]`) when a role already covers the case — that was the most common bug. Inline metadata, section headers and clickable labels are all Label (`text-xs`), never a bespoke size in between.
- **Don't** use `text-white` / `bg-white` / `#fff` anywhere, including inside small badges — use `text-foreground`, which reads the same at a glance but keeps every "white" in the app on the one off-white token.
