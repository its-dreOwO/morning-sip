# Morning Dashboard — Design Spec

**Date:** 2026-05-31
**Status:** Approved for planning

## 1. Purpose

A personal **morning dashboard** — a single-page web app opened at the start of the
day to answer "what should I do today?" at a glance. A draggable grid of widgets
over a warm "Mocha" dark theme, with charts (not just numbers), content-aware sizing,
and smooth motion throughout.

v1 runs on **mock + easy-live data**. OAuth-heavy sources (Gmail, Google Calendar,
GCP) are stubbed behind a typed data-source interface so they can be wired to real
APIs later by editing one file each — no widget or UI changes.

## 2. Scope

### In scope (v1)
- Dashboard shell: draggable/resizable widget grid, layout persisted to `localStorage`.
- Theme system (Mocha) built from design tokens.
- Seven widgets: Clock + Greeting, Todos, Weather, GitHub, Calendar, Mail, GCP.
- Per-widget data via a typed `useData()` hook; live for Weather + GitHub, mock for
  Calendar/Mail/GCP, none for Clock/Todos.
- Charts (Recharts), animations (Framer Motion + Lottie), dynamic widget states.
- Add/remove/rearrange widgets; theme is fixed (Mocha) but token-driven.

### Out of scope (deliberate — later phases)
- Any backend, server, or auth/OAuth flows.
- Real Gmail / Google Calendar / GCP API integration (data layer is shaped for it).
- Multi-theme / light mode (tokens make it cheap later, but not built now).
- Settings page beyond add/remove/rearrange.
- Multi-user, accounts, deployment/hosting.

## 3. Stack

- **React + Vite + TypeScript + Tailwind CSS**
- **react-grid-layout** — drag/resize/add/remove; layout saved to `localStorage`.
- **Recharts** — line/area, donut, bar charts.
- **Framer Motion** — intra-widget motion (see §6).
- **lottie-react** — decorative vector animations (e.g. animated weather icon).
- **Vitest + React Testing Library** — tests.
- No backend.

## 4. Architecture

```
src/
  app/            App shell, grid host, theme provider, layout persistence
  theme/          tokens.ts (Mocha palette + accents); Tailwind theme extension
  widgets/
    registry.ts   array of WidgetDefinition; the grid only knows this
    Clock/  Todos/  Weather/  GitHub/  Calendar/  Mail/  GCP/
  data/
    types.ts      shared data-source result types
    sources/      weatherSource (live), githubSource (live),
                  calendarSource (mock), mailSource (mock), gcpSource (mock)
  components/      WidgetFrame, chart wrappers, AnimatedNumber, Skeleton, ExpandOverlay
```

### The widget contract (core abstraction)

Every widget is a `WidgetDefinition`:

```ts
interface WidgetDefinition<TData = unknown> {
  id: string;                    // stable key, e.g. "weather"
  name: string;                  // display name in the add-widget menu
  defaultSize: { w: number; h: number };   // grid units
  minSize: { w: number; h: number };
  Component: React.FC<{ data: TData; state: WidgetState; expanded: boolean }>;
  useData: () => WidgetDataResult<TData>;   // hides live vs mock
}

type WidgetState = "loading" | "ready" | "empty" | "error";
interface WidgetDataResult<T> {
  state: WidgetState;
  data: T | null;
  error?: string;
}
```

- The grid host renders from `registry.ts` only; it never imports a specific widget.
- `useData()` hides whether data is live or mock behind one type. Swapping
  `mailSource` from mock to real Gmail later touches **one file** (`data/sources/mailSource.ts`),
  not the widget component.
- This contract is what makes "add more widgets later" and "wire OAuth incrementally"
  cheap.

## 5. Theme system

`theme/tokens.ts` defines the Mocha tokens, exposed as CSS variables and mapped into
Tailwind:

| Token          | Value      | Use                          |
|----------------|------------|------------------------------|
| `bg-deep`      | `#2f2924`  | page background (gradient lo)|
| `bg-raised`    | `#3a332d`  | page background (gradient hi)|
| `card-surface` | `#ffffff14`| widget panel fill            |
| `text-bright`  | `#fdf9f3`  | headings, key numbers        |
| `text-muted`   | `#b6a594`  | secondary text               |

Accent set (each widget assigned exactly one): `amber #ffc879` (primary),
`teal #5fe0c8`, `coral #ff8f7a` (alerts), `violet #c2a6ff`, `green #a6e081` (positive).
Important values render in the widget's accent at full brightness for contrast.

Because everything is tokens/CSS variables, a future light theme or accent change is a
token swap with no component edits.

## 6. Dynamic states & animation

**Boundary rule (resolves the RGL ↔ Framer Motion transform conflict):**
react-grid-layout owns grid-cell geometry (position + size via its own transforms).
Framer Motion is confined to **intra-widget content** and must **not** use the `layout`
prop on grid items. Allowed Framer usage: `AnimatePresence` for list add/remove,
`AnimatedNumber` count-ups, chart draw-on-mount, staggered entrance, hover lift, drag
elevation, and the expand overlay.

**Resize vs auto-size rule (resolves the contradiction):**
- A widget's `defaultSize` plus a content-derived suggested height sets its **initial**
  grid height when first added.
- Once the user **manually resizes** a widget, that widget is **pinned** — it no longer
  auto-grows; overflowing content scrolls internally.
- "Expand for detail" is a **separate click-to-expand overlay** (full list / more chart
  history) rendered above the grid via `AnimatePresence`. It does **not** resize the
  grid cell, which also avoids the transform conflict.

**Per-widget states:** `loading` (skeleton shimmer) → `ready` (content fade-in),
plus `empty` and `error` visuals. Defined once in `WidgetFrame`.

## 7. Data sources (v1)

| Widget   | Source        | v1 mode | Notes                                                |
|----------|---------------|---------|------------------------------------------------------|
| Clock    | local time    | live    | no fetch                                             |
| Todos    | localStorage  | live    | user-managed checklist                               |
| Weather  | Open-Meteo    | live    | no API key required                                  |
| GitHub   | GitHub REST   | live    | **unauthenticated = 60 req/hr**; cache + note in source |
| Calendar | mock          | mock    | shaped for Google Calendar OAuth later               |
| Mail     | mock          | mock    | shaped for Gmail OAuth later                         |
| GCP      | mock          | mock    | shaped for GCP APIs later                            |

## 8. Testing

Vitest + React Testing Library:
- Widget-contract conformance (every registry entry satisfies `WidgetDefinition`).
- Registry integrity (unique ids, valid sizes).
- Data-source hooks with mocked fetch (loading/ready/empty/error transitions).
- Layout persistence (save → reload → restored).
- Charts/animations: smoke-render only (no pixel comparison).

## 9. Notes for planning

- Build a **walking skeleton first**: shell + theme tokens + widget contract + ONE
  widget (Weather, since it's live and simple) end-to-end. Validate the contract once
  against real implementation before fanning out to the other six.
- GitHub rate limit (60/hr unauthenticated) handled with a short cache; documented in
  `githubSource`. Optional personal access token can raise it later.
