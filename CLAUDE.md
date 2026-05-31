# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal "morning dashboard" SPA — the page you open with coffee to see GitHub status, mail, GCP, weather, calendar, todos, etc. as a grid of draggable/resizable widgets. React 19 + Vite 8 + TypeScript 6 + Tailwind 3.4. Design intent (comfy low-saturation "brightened Mocha" palette, charts over bare numbers, lots of animation, per-widget dynamic/expand states) lives in `docs/superpowers/specs/2026-05-31-morning-dashboard-design.md`; the phased task plan is in `docs/superpowers/plans/2026-05-31-morning-dashboard.md`.

## Commands

```bash
npm run dev          # Vite dev server (http://localhost:5173)
npm run build        # tsc -b && vite build — THE typecheck gate (see below)
npm run lint         # eslint
npm test             # vitest run (one-shot)
npm run test:watch   # vitest watch
npx vitest run src/widgets/Weather/WeatherWidget.test.tsx   # run a single test file
npx vitest run -t "transitions to ready"                    # run tests matching a name
```

**Typecheck gate:** `tsc --noEmit` is a NO-OP here (the root tsconfig uses project references with no files of its own). The real typecheck is `tsc -b`, which runs as part of `npm run build`. Always verify type changes with `npm run build`, not `tsc --noEmit`.

## Architecture

Everything is built around a **widget contract** so widgets can be developed independently and dropped into a registry.

- **`src/data/types.ts`** — `WidgetState` (`loading|ready|empty|error`), `WidgetDataResult<T>` (`{ state, data, error? }`), and `isReady<T>` type guard. Every data hook returns a `WidgetDataResult`.
- **`src/widgets/types.ts`** — `WidgetDefinition<TData>` (id, name, accent, defaultSize, minSize, `Component`, `useData`) and the `defineWidget<TData>()` helper. **Always register via `defineWidget({...})`, never with `as` casts** — it infers `TData` to force `Component` and `useData` to agree, then type-erases for the registry array. This is the only place erasure happens.
- **`src/widgets/registry.ts`** — the array of all widgets. Adding a widget = add one `defineWidget(...)` entry here; the grid, host, and layout reconciliation pick it up automatically. The registry is the sole coupling point.
- **Per-widget folder** (`src/widgets/<Name>/`) — exports a `<Name>View` component (`WidgetViewProps<TData>`) and a `use<Name>Data()` hook. Live-vs-mock data is hidden behind a source module in `src/data/sources/`.
- **`src/components/WidgetHost.tsx`** — renders a widget purely from its `def`: calls `def.useData()`, wraps in `WidgetFrame`, passes data/state to `def.Component`.
- **`src/components/WidgetFrame.tsx`** — card chrome + accent color; renders skeleton/error/empty/children based on `state`.
- **`src/components/DashboardGrid.tsx`** — hosts the grid, persists layout to `localStorage` (`dashboard.layout`). `defaultLayout()`, `reconcileLayout(stored)` (drops orphaned ids, appends registry widgets the stored layout lacks — keeps persisted layout in sync as the registry grows), `sameLayout()`.

### react-grid-layout is v2 (not v1)

Installed `react-grid-layout@2.x` has a **rewritten API** that differs from most docs/examples online and from the `@types/react-grid-layout@1.x` types:
- `Layout` is `readonly LayoutItem[]` (an array), not an object map. Per-item type is `LayoutItem`.
- Config is grouped: `gridConfig={{ cols, rowHeight }}` and `dragConfig={{ handle: ".drag-handle" }}` — **not** flat `cols` / `rowHeight` / `draggableHandle` props.
- `onLayoutChange={(l: Layout) => setLayout([...l])}`.

Verify the actual API against `node_modules/react-grid-layout/dist/*.d.ts` rather than trusting examples.

### Animation / layout boundary

react-grid-layout owns grid-cell geometry. Framer Motion is confined to **intra-widget content** — never put a `layout` prop on a grid item, and never animate cell size. A widget's "expand" state is an overlay, not a cell resize.

### Theme

CSS variables in `src/index.css` are mapped to Tailwind tokens in `tailwind.config.js`: `bg-deep`, `bg-raised`, `card`, `text-bright`, `text-muted`, plus five accents (`accent-amber|teal|coral|violet|green`). Style with these tokens, not raw hex.

## Conventions

- **TDD**: each widget = source + view + hook + registry entry, written test-first. Verify with `npm run build` then `npx vitest run`.
- Tests use Vitest + React Testing Library + jsdom (`src/test/setup.ts` loads jest-dom). Mock data sources at the module boundary (see `useWeatherData.test.tsx`); stub `fetch` for full-tree mounts (see `App.test.tsx`).
