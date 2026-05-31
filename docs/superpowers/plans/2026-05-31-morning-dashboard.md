# Morning Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a personal morning dashboard — a draggable grid of animated, chart-rich widgets over a warm "Mocha" theme, running on mock + easy-live data.

**Architecture:** React SPA. A grid host renders widgets from a registry; each widget satisfies a `WidgetDefinition` contract and gets its data from a typed `useData()` hook that hides live-vs-mock behind one type. react-grid-layout owns cell geometry; Framer Motion handles only intra-widget motion. Theme is token-driven.

**Tech Stack:** React + Vite + TypeScript + Tailwind CSS, react-grid-layout, Recharts, Framer Motion, lottie-react, Vitest + React Testing Library.

**Source spec:** `docs/superpowers/specs/2026-05-31-morning-dashboard-design.md`

**⚠️ Environment notes (discovered during execution):**
- The installed `react-grid-layout` is **v2.x** (a rewrite). `GridLayout` takes `gridConfig={{ cols, rowHeight }}` and `dragConfig={{ handle }}` — NOT flat `cols`/`rowHeight`/`draggableHandle` props. The per-item type is `LayoutItem`; `Layout` is `readonly LayoutItem[]`. `onLayoutChange` gives a readonly `Layout`, so copy it (`[...l]`) before storing.
- **`tsc --noEmit` is a no-op** in this project (root tsconfig uses project references). The real typecheck/build gate is **`npm run build`** (`tsc -b && vite build`). Use it, not `tsc --noEmit`.

---

## File Structure

```
src/
  main.tsx                     App entry
  App.tsx                      Theme provider + DashboardGrid
  theme/tokens.ts              Mocha palette, accents (single source of truth)
  data/
    types.ts                   WidgetState, WidgetDataResult
    sources/
      weatherSource.ts         live (Open-Meteo)
      githubSource.ts          live (GitHub REST, cached)
      calendarSource.ts        mock
      mailSource.ts            mock
      gcpSource.ts             mock
  widgets/
    types.ts                   WidgetDefinition contract
    registry.ts                array of all widgets
    Clock/ClockWidget.tsx
    Todos/TodosWidget.tsx
    Weather/WeatherWidget.tsx
    GitHub/GitHubWidget.tsx
    Calendar/CalendarWidget.tsx
    Mail/MailWidget.tsx
    GCP/GcpWidget.tsx
  components/
    WidgetFrame.tsx            card chrome + loading/empty/error states
    AnimatedNumber.tsx         count-up
    Skeleton.tsx               shimmer placeholder
    ExpandOverlay.tsx          click-to-expand floating detail
    DashboardGrid.tsx          react-grid-layout host + persistence
    AddWidgetMenu.tsx          add/remove widgets
  lib/
    useLocalStorage.ts         persisted state hook
  test/setup.ts                Vitest + RTL setup
```

---

## Phase 0 — Project scaffold

### Task 0.1: Scaffold Vite React-TS project

**Files:**
- Create: project files via scaffolding in `/home/dre/Desktop/website`

- [ ] **Step 1: Scaffold into current directory**

Run:
```bash
cd /home/dre/Desktop/website
npm create vite@latest . -- --template react-ts
```
If prompted about the non-empty directory (docs/, .git, .gitignore exist), choose "Ignore files and continue".

- [ ] **Step 2: Install runtime dependencies**

Run:
```bash
npm install react-grid-layout recharts framer-motion lottie-react
npm install -D @types/react-grid-layout
```

- [ ] **Step 3: Install Tailwind + test tooling**

Run:
```bash
npm install -D tailwindcss@^3 postcss autoprefixer vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
npx tailwindcss init -p
```

- [ ] **Step 4: Verify dev server boots**

Run: `npm run dev` (then Ctrl-C)
Expected: Vite prints a `localhost` URL with no errors.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: scaffold Vite React-TS project with deps"
```

### Task 0.2: Configure Tailwind, Vitest, and global styles

**Files:**
- Modify: `tailwind.config.js`
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`
- Replace: `src/index.css`

- [ ] **Step 1: Configure Tailwind content + theme tokens as CSS vars**

`tailwind.config.js`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "bg-deep": "var(--bg-deep)",
        "bg-raised": "var(--bg-raised)",
        "card": "var(--card-surface)",
        "text-bright": "var(--text-bright)",
        "text-muted": "var(--text-muted)",
        "accent-amber": "#ffc879",
        "accent-teal": "#5fe0c8",
        "accent-coral": "#ff8f7a",
        "accent-violet": "#c2a6ff",
        "accent-green": "#a6e081",
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Replace `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg-deep: #2f2924;
  --bg-raised: #3a332d;
  --card-surface: rgba(255, 255, 255, 0.08);
  --text-bright: #fdf9f3;
  --text-muted: #b6a594;
}

html, body, #root { height: 100%; }
body {
  margin: 0;
  background: linear-gradient(160deg, var(--bg-raised) 0%, var(--bg-deep) 100%);
  background-attachment: fixed;
  color: var(--text-bright);
  font-family: ui-sans-serif, system-ui, sans-serif;
}

/* react-grid-layout base styles */
@import "react-grid-layout/css/styles.css";
@import "react-resizable/css/styles.css";
```

- [ ] **Step 3: Configure Vitest in `vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
```
If TypeScript flags the `test` key, add `/// <reference types="vitest/config" />` at the top of the file.

- [ ] **Step 4: Create `src/test/setup.ts`**

```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 5: Add test script to `package.json`**

Add to `"scripts"`: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 6: Verify the test runner starts**

Run: `npm test`
Expected: Vitest runs and reports "No test files found" (exit ok) — confirms config loads.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore: configure Tailwind, Vitest, Mocha theme vars"
```

---

## Phase 1 — Walking skeleton (contract + grid + one live widget)

> Goal of this phase: prove the full path end-to-end with the Weather widget before fanning out to the other six.

### Task 1.1: Data-source types

**Files:**
- Create: `src/data/types.ts`
- Test: `src/data/types.test.ts`

- [ ] **Step 1: Write the failing test**

`src/data/types.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { isReady } from "./types";

describe("isReady", () => {
  it("returns true only when state is ready and data is present", () => {
    expect(isReady({ state: "ready", data: { x: 1 } })).toBe(true);
    expect(isReady({ state: "loading", data: null })).toBe(false);
    expect(isReady({ state: "ready", data: null })).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/types.test.ts`
Expected: FAIL — cannot find module `./types` / `isReady` not exported.

- [ ] **Step 3: Write minimal implementation**

`src/data/types.ts`:
```ts
export type WidgetState = "loading" | "ready" | "empty" | "error";

export interface WidgetDataResult<T> {
  state: WidgetState;
  data: T | null;
  error?: string;
}

export function isReady<T>(
  r: WidgetDataResult<T>
): r is WidgetDataResult<T> & { state: "ready"; data: T } {
  return r.state === "ready" && r.data !== null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/types.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add widget data-source types"
```

### Task 1.2: Widget contract types

**Files:**
- Create: `src/widgets/types.ts`

- [ ] **Step 1: Write the contract (no test — pure types)**

`src/widgets/types.ts`:
```ts
import type { FC } from "react";
import type { WidgetDataResult } from "../data/types";

export type AccentName = "amber" | "teal" | "coral" | "violet" | "green";
export type WidgetState = "loading" | "ready" | "empty" | "error";

export interface WidgetSize { w: number; h: number; }

export interface WidgetViewProps<TData> {
  data: TData | null;
  state: WidgetState;
  expanded: boolean;
}

export interface WidgetDefinition<TData = unknown> {
  id: string;
  name: string;
  accent: AccentName;
  defaultSize: WidgetSize;
  minSize: WidgetSize;
  Component: FC<WidgetViewProps<TData>>;
  useData: () => WidgetDataResult<TData>;
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add widget contract types"
```

### Task 1.3: useLocalStorage hook

**Files:**
- Create: `src/lib/useLocalStorage.ts`
- Test: `src/lib/useLocalStorage.test.ts`

- [ ] **Step 1: Write the failing test**

`src/lib/useLocalStorage.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "./useLocalStorage";

beforeEach(() => localStorage.clear());

describe("useLocalStorage", () => {
  it("returns the default when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage("k", 5));
    expect(result.current[0]).toBe(5);
  });

  it("persists updates to localStorage", () => {
    const { result } = renderHook(() => useLocalStorage("k", 5));
    act(() => result.current[1](10));
    expect(result.current[0]).toBe(10);
    expect(JSON.parse(localStorage.getItem("k")!)).toBe(10);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/useLocalStorage.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

`src/lib/useLocalStorage.ts`:
```ts
import { useState, useCallback } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  const set = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore quota errors */
      }
    },
    [key]
  );

  return [value, set] as const;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/useLocalStorage.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add useLocalStorage hook"
```

### Task 1.4: WidgetFrame (card chrome + states)

**Files:**
- Create: `src/components/Skeleton.tsx`
- Create: `src/components/WidgetFrame.tsx`
- Test: `src/components/WidgetFrame.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/WidgetFrame.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WidgetFrame } from "./WidgetFrame";

describe("WidgetFrame", () => {
  it("shows a skeleton while loading", () => {
    render(<WidgetFrame title="Weather" accent="amber" state="loading">content</WidgetFrame>);
    expect(screen.getByTestId("widget-skeleton")).toBeInTheDocument();
  });

  it("shows an error message on error", () => {
    render(<WidgetFrame title="Weather" accent="amber" state="error" error="boom">x</WidgetFrame>);
    expect(screen.getByText(/boom/)).toBeInTheDocument();
  });

  it("renders children when ready", () => {
    render(<WidgetFrame title="Weather" accent="amber" state="ready">hello</WidgetFrame>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/WidgetFrame.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/components/Skeleton.tsx`**

```tsx
export function Skeleton() {
  return (
    <div
      data-testid="widget-skeleton"
      className="h-full w-full animate-pulse rounded-lg bg-white/5"
    />
  );
}
```

- [ ] **Step 4: Create `src/components/WidgetFrame.tsx`**

```tsx
import type { ReactNode } from "react";
import type { AccentName, WidgetState } from "../widgets/types";
import { Skeleton } from "./Skeleton";

const accentClass: Record<AccentName, string> = {
  amber: "text-accent-amber",
  teal: "text-accent-teal",
  coral: "text-accent-coral",
  violet: "text-accent-violet",
  green: "text-accent-green",
};

interface Props {
  title: string;
  accent: AccentName;
  state: WidgetState;
  error?: string;
  children: ReactNode;
}

export function WidgetFrame({ title, accent, state, error, children }: Props) {
  return (
    <div className="flex h-full w-full flex-col gap-2 rounded-2xl border border-white/10 bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-text-muted">{title}</span>
      </div>
      <div className={`flex-1 overflow-auto ${accentClass[accent]}`}>
        {state === "loading" && <Skeleton />}
        {state === "error" && <p className="text-sm text-accent-coral">{error ?? "Something went wrong"}</p>}
        {state === "empty" && <p className="text-sm text-text-muted">Nothing here yet.</p>}
        {state === "ready" && children}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/WidgetFrame.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add WidgetFrame with loading/empty/error states"
```

### Task 1.5: Weather data source (live, Open-Meteo)

**Files:**
- Create: `src/data/sources/weatherSource.ts`
- Test: `src/data/sources/weatherSource.test.ts`

- [ ] **Step 1: Write the failing test**

`src/data/sources/weatherSource.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchWeather } from "./weatherSource";

beforeEach(() => vi.restoreAllMocks());

describe("fetchWeather", () => {
  it("maps Open-Meteo response into WeatherData", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: { temperature_2m: 18, weather_code: 2 },
        hourly: { temperature_2m: [17, 18, 19, 20, 21, 22] },
        daily: { temperature_2m_max: [21], temperature_2m_min: [11] },
      }),
    }));
    const data = await fetchWeather(1, 2);
    expect(data.tempC).toBe(18);
    expect(data.high).toBe(21);
    expect(data.low).toBe(11);
    expect(data.nextHours).toEqual([17, 18, 19, 20, 21, 22]);
    expect(data.condition).toMatch(/cloud/i);
  });

  it("throws on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    await expect(fetchWeather(1, 2)).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/sources/weatherSource.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write implementation**

`src/data/sources/weatherSource.ts`:
```ts
export interface WeatherData {
  tempC: number;
  condition: string;
  high: number;
  low: number;
  nextHours: number[];
}

const CODE_MAP: Record<number, string> = {
  0: "Clear", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 51: "Drizzle", 61: "Rain", 71: "Snow", 80: "Showers", 95: "Thunderstorm",
};

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code&hourly=temperature_2m` +
    `&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather request failed: ${res.status}`);
  const j = await res.json();
  return {
    tempC: Math.round(j.current.temperature_2m),
    condition: CODE_MAP[j.current.weather_code] ?? "Unknown",
    high: Math.round(j.daily.temperature_2m_max[0]),
    low: Math.round(j.daily.temperature_2m_min[0]),
    nextHours: (j.hourly.temperature_2m as number[]).slice(0, 6).map(Math.round),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/sources/weatherSource.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add live weather data source (Open-Meteo)"
```

### Task 1.6: Weather widget

**Files:**
- Create: `src/widgets/Weather/WeatherWidget.tsx`
- Test: `src/widgets/Weather/WeatherWidget.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/widgets/Weather/WeatherWidget.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WeatherView } from "./WeatherWidget";

describe("WeatherView", () => {
  it("renders temperature and condition when ready", () => {
    render(
      <WeatherView
        state="ready"
        expanded={false}
        data={{ tempC: 18, condition: "Partly cloudy", high: 21, low: 11, nextHours: [17, 18, 19] }}
      />
    );
    expect(screen.getByText("18°")).toBeInTheDocument();
    expect(screen.getByText(/Partly cloudy/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/widgets/Weather/WeatherWidget.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Write implementation**

`src/widgets/Weather/WeatherWidget.tsx`:
```tsx
import { useEffect, useState } from "react";
import type { WidgetViewProps } from "../types";
import type { WidgetDataResult } from "../../data/types";
import { fetchWeather, type WeatherData } from "../../data/sources/weatherSource";

// Default location: London. Wire to geolocation later.
const LAT = 51.5072;
const LON = -0.1276;

export function WeatherView({ data, state }: WidgetViewProps<WeatherData>) {
  if (state !== "ready" || !data) return null;
  const max = Math.max(...data.nextHours, 1);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-accent-amber">{data.tempC}°</span>
        <span className="text-sm text-text-muted">{data.condition}</span>
      </div>
      <div className="text-xs text-text-muted">H{data.high}° L{data.low}°</div>
      <div className="flex h-12 items-end gap-1">
        {data.nextHours.map((t, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-accent-amber"
            style={{ height: `${(t / max) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function useWeatherData(): WidgetDataResult<WeatherData> {
  const [result, setResult] = useState<WidgetDataResult<WeatherData>>({
    state: "loading",
    data: null,
  });
  useEffect(() => {
    let active = true;
    fetchWeather(LAT, LON)
      .then((d) => active && setResult({ state: "ready", data: d }))
      .catch((e) => active && setResult({ state: "error", data: null, error: String(e) }));
    return () => {
      active = false;
    };
  }, []);
  return result;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/widgets/Weather/WeatherWidget.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add Weather widget (view + data hook)"
```

### Task 1.7: Registry with Weather only

**Files:**
- Create: `src/widgets/registry.ts`
- Test: `src/widgets/registry.test.ts`

- [ ] **Step 1: Write the failing test**

`src/widgets/registry.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { registry } from "./registry";

describe("registry", () => {
  it("has unique ids", () => {
    const ids = registry.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it("every widget has a Component, useData, and valid sizes", () => {
    for (const w of registry) {
      expect(typeof w.Component).toBe("function");
      expect(typeof w.useData).toBe("function");
      expect(w.defaultSize.w).toBeGreaterThanOrEqual(w.minSize.w);
      expect(w.defaultSize.h).toBeGreaterThanOrEqual(w.minSize.h);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/widgets/registry.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Write implementation**

`src/widgets/registry.ts`:
```ts
import type { WidgetDefinition } from "./types";
import { WeatherView, useWeatherData } from "./Weather/WeatherWidget";

export const registry: WidgetDefinition[] = [
  {
    id: "weather",
    name: "Weather",
    accent: "amber",
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    Component: WeatherView as WidgetDefinition["Component"],
    useData: useWeatherData as WidgetDefinition["useData"],
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/widgets/registry.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add widget registry with Weather"
```

### Task 1.8: DashboardGrid host with persistence + WidgetHost

**Files:**
- Create: `src/components/WidgetHost.tsx`
- Create: `src/components/DashboardGrid.tsx`
- Test: `src/components/DashboardGrid.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/DashboardGrid.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { defaultLayout } from "./DashboardGrid";
import { registry } from "../widgets/registry";

beforeEach(() => localStorage.clear());

describe("defaultLayout", () => {
  it("creates one layout entry per registry widget with valid sizes", () => {
    const layout = defaultLayout();
    expect(layout).toHaveLength(registry.length);
    for (const item of layout) {
      const w = registry.find((r) => r.id === item.i)!;
      expect(item.w).toBe(w.defaultSize.w);
      expect(item.h).toBe(w.defaultSize.h);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/DashboardGrid.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Create `src/components/WidgetHost.tsx`**

```tsx
import type { WidgetDefinition } from "../widgets/types";
import { WidgetFrame } from "./WidgetFrame";

export function WidgetHost({ def }: { def: WidgetDefinition }) {
  const result = def.useData();
  const Component = def.Component;
  return (
    <WidgetFrame title={def.name} accent={def.accent} state={result.state} error={result.error}>
      <Component data={result.data} state={result.state} expanded={false} />
    </WidgetFrame>
  );
}
```

- [ ] **Step 4: Create `src/components/DashboardGrid.tsx`**

```tsx
import GridLayout, { type Layout } from "react-grid-layout";
import { registry } from "../widgets/registry";
import { useLocalStorage } from "../lib/useLocalStorage";
import { WidgetHost } from "./WidgetHost";

const COLS = 6;
const ROW_HEIGHT = 90;
const WIDTH = 1080;

export function defaultLayout(): Layout[] {
  let x = 0;
  let y = 0;
  return registry.map((w) => {
    if (x + w.defaultSize.w > COLS) {
      x = 0;
      y += w.defaultSize.h;
    }
    const item: Layout = {
      i: w.id,
      x,
      y,
      w: w.defaultSize.w,
      h: w.defaultSize.h,
      minW: w.minSize.w,
      minH: w.minSize.h,
    };
    x += w.defaultSize.w;
    return item;
  });
}

export function DashboardGrid() {
  const [layout, setLayout] = useLocalStorage<Layout[]>("dashboard.layout", defaultLayout());
  const visible = registry.filter((w) => layout.some((l) => l.i === w.id));

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={COLS}
      rowHeight={ROW_HEIGHT}
      width={WIDTH}
      onLayoutChange={(l) => setLayout(l)}
      draggableHandle=".drag-handle"
    >
      {visible.map((w) => (
        <div key={w.id}>
          <div className="drag-handle h-full w-full cursor-move">
            <WidgetHost def={w} />
          </div>
        </div>
      ))}
    </GridLayout>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/DashboardGrid.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add DashboardGrid host with layout persistence"
```

### Task 1.9: Wire App + manual end-to-end check

**Files:**
- Replace: `src/App.tsx`
- Modify: `src/main.tsx` (ensure it imports `./index.css`)

- [ ] **Step 1: Replace `src/App.tsx`**

```tsx
import { DashboardGrid } from "./components/DashboardGrid";

export default function App() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <main className="mx-auto max-w-[1120px] p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-text-bright">{greeting}, Dre</h1>
        <p className="text-sm text-text-muted">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </header>
      <DashboardGrid />
    </main>
  );
}
```

- [ ] **Step 2: Confirm `src/main.tsx` imports `./index.css`** (Vite template already does; add if missing).

- [ ] **Step 3: Typecheck + run the app**

Run: `npx tsc --noEmit && npm run dev`
Expected: App loads, shows greeting + a draggable Weather widget that fetches live data (temperature + forecast bars). Drag works. Reload preserves position.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: wire App shell with greeting and dashboard grid"
```

---

## Phase 2 — Remaining widgets

> Each widget follows the Phase-1 pattern: a `*View` component (pure, prop-driven) + a `use*Data` hook, then a registry entry. Add the registry entry in the same task.

### Task 2.1: Clock widget

**Files:**
- Create: `src/widgets/Clock/ClockWidget.tsx`
- Test: `src/widgets/Clock/ClockWidget.test.tsx`
- Modify: `src/widgets/registry.ts`

- [ ] **Step 1: Write the failing test**

`src/widgets/Clock/ClockWidget.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClockView } from "./ClockWidget";

describe("ClockView", () => {
  it("renders the provided time string", () => {
    render(<ClockView state="ready" expanded={false} data={{ time: "7:42", date: "Saturday" }} />);
    expect(screen.getByText("7:42")).toBeInTheDocument();
    expect(screen.getByText("Saturday")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/widgets/Clock/ClockWidget.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write implementation**

`src/widgets/Clock/ClockWidget.tsx`:
```tsx
import { useEffect, useState } from "react";
import type { WidgetViewProps } from "../types";
import type { WidgetDataResult } from "../../data/types";

export interface ClockData { time: string; date: string; }

export function ClockView({ data, state }: WidgetViewProps<ClockData>) {
  if (state !== "ready" || !data) return null;
  return (
    <div className="flex h-full flex-col justify-center">
      <span className="text-4xl font-bold leading-none text-text-bright">{data.time}</span>
      <span className="mt-1 text-sm text-text-muted">{data.date}</span>
    </div>
  );
}

export function useClockData(): WidgetDataResult<ClockData> {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return {
    state: "ready",
    data: {
      time: now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
      date: now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
    },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/widgets/Clock/ClockWidget.test.tsx`
Expected: PASS.

- [ ] **Step 5: Register the widget** — add to the `registry` array in `src/widgets/registry.ts`:

```ts
import { ClockView, useClockData } from "./Clock/ClockWidget";
// ...add as the FIRST array element:
{
  id: "clock",
  name: "Clock",
  accent: "amber",
  defaultSize: { w: 2, h: 1 },
  minSize: { w: 2, h: 1 },
  Component: ClockView as WidgetDefinition["Component"],
  useData: useClockData as WidgetDefinition["useData"],
},
```

- [ ] **Step 6: Run registry test + commit**

Run: `npx vitest run src/widgets/registry.test.ts`
Expected: PASS.
```bash
git add -A && git commit -m "feat: add Clock widget"
```

### Task 2.2: Todos widget (localStorage)

**Files:**
- Create: `src/widgets/Todos/TodosWidget.tsx`
- Test: `src/widgets/Todos/TodosWidget.test.tsx`
- Modify: `src/widgets/registry.ts`

- [ ] **Step 1: Write the failing test**

`src/widgets/Todos/TodosWidget.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TodosView } from "./TodosWidget";

describe("TodosView", () => {
  it("renders todo items and a remaining count", () => {
    render(
      <TodosView
        state="ready"
        expanded={false}
        data={{
          items: [
            { id: "1", text: "Ship PR", done: false },
            { id: "2", text: "Coffee", done: true },
          ],
          onToggle: () => {},
        }}
      />
    );
    expect(screen.getByText("Ship PR")).toBeInTheDocument();
    expect(screen.getByText(/1 left/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/widgets/Todos/TodosWidget.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write implementation**

`src/widgets/Todos/TodosWidget.tsx`:
```tsx
import type { WidgetViewProps } from "../types";
import type { WidgetDataResult } from "../../data/types";
import { useLocalStorage } from "../../lib/useLocalStorage";

export interface TodoItem { id: string; text: string; done: boolean; }
export interface TodosData { items: TodoItem[]; onToggle: (id: string) => void; }

export function TodosView({ data, state }: WidgetViewProps<TodosData>) {
  if (state !== "ready" || !data) return null;
  const remaining = data.items.filter((t) => !t.done).length;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-accent-green">{remaining} left</span>
      <ul className="flex flex-col gap-1">
        {data.items.map((t) => (
          <li key={t.id}>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={t.done} onChange={() => data.onToggle(t.id)} />
              <span className={t.done ? "text-text-muted line-through" : "text-text-bright"}>{t.text}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

const SEED: TodoItem[] = [
  { id: "1", text: "Ship the PR", done: false },
  { id: "2", text: "Email Sam", done: false },
  { id: "3", text: "Standup notes", done: true },
];

export function useTodosData(): WidgetDataResult<TodosData> {
  const [items, setItems] = useLocalStorage<TodoItem[]>("todos.items", SEED);
  const onToggle = (id: string) =>
    setItems(items.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  return { state: "ready", data: { items, onToggle } };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/widgets/Todos/TodosWidget.test.tsx`
Expected: PASS.

- [ ] **Step 5: Register** — add to `registry.ts`:

```ts
import { TodosView, useTodosData } from "./Todos/TodosWidget";
{
  id: "todos",
  name: "Todos",
  accent: "green",
  defaultSize: { w: 2, h: 2 },
  minSize: { w: 2, h: 2 },
  Component: TodosView as WidgetDefinition["Component"],
  useData: useTodosData as WidgetDefinition["useData"],
},
```

- [ ] **Step 6: Run registry test + commit**

```bash
npx vitest run src/widgets/registry.test.ts
git add -A && git commit -m "feat: add Todos widget with localStorage persistence"
```

### Task 2.3: GitHub widget (live, cached, rate-limit aware)

**Files:**
- Create: `src/data/sources/githubSource.ts`
- Test: `src/data/sources/githubSource.test.ts`
- Create: `src/widgets/GitHub/GitHubWidget.tsx`
- Test: `src/widgets/GitHub/GitHubWidget.test.tsx`
- Modify: `src/widgets/registry.ts`

- [ ] **Step 1: Write the failing source test**

`src/data/sources/githubSource.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchGitHubActivity } from "./githubSource";

beforeEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

describe("fetchGitHubActivity", () => {
  it("counts push events per day for the last 7 days", async () => {
    const events = [
      { type: "PushEvent", created_at: new Date().toISOString(), payload: { commits: [{}, {}] } },
      { type: "WatchEvent", created_at: new Date().toISOString(), payload: {} },
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => events }));
    const data = await fetchGitHubActivity("octocat");
    expect(data.totalCommits).toBe(2);
    expect(data.perDay).toHaveLength(7);
  });

  it("throws a friendly error on 403 (rate limit)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 403 }));
    await expect(fetchGitHubActivity("octocat")).rejects.toThrow(/rate limit/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/sources/githubSource.test.ts`
Expected: FAIL.

- [ ] **Step 3: Write the source**

`src/data/sources/githubSource.ts`:
```ts
// NOTE: Unauthenticated GitHub API is limited to 60 requests/hour per IP.
// We cache responses for 10 minutes in localStorage to stay well under that.
// To raise the limit later, send an "Authorization: Bearer <token>" header.

export interface GitHubData {
  totalCommits: number;
  perDay: { day: string; commits: number }[];
}

const CACHE_KEY = "github.cache";
const TTL_MS = 10 * 60 * 1000;

export async function fetchGitHubActivity(user: string): Promise<GitHubData> {
  const cached = readCache(user);
  if (cached) return cached;

  const res = await fetch(`https://api.github.com/users/${user}/events/public?per_page=100`);
  if (res.status === 403) throw new Error("GitHub rate limit reached. Try again later.");
  if (!res.ok) throw new Error(`GitHub request failed: ${res.status}`);
  const events: any[] = await res.json();

  const days: { day: string; commits: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ day: d.toLocaleDateString(undefined, { weekday: "short" }), commits: 0 });
  }
  let total = 0;
  for (const e of events) {
    if (e.type !== "PushEvent") continue;
    const created = new Date(e.created_at);
    const idx = days.findIndex(
      (_, i) => sameDay(created, daysAgo(6 - i))
    );
    const n = e.payload?.commits?.length ?? 0;
    if (idx >= 0) days[idx].commits += n;
    total += n;
  }
  const data: GitHubData = { totalCommits: total, perDay: days };
  writeCache(user, data);
  return data;
}

function daysAgo(n: number): Date { const d = new Date(); d.setDate(d.getDate() - n); return d; }
function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function readCache(user: string): GitHubData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { user: u, at, data } = JSON.parse(raw);
    if (u === user && Date.now() - at < TTL_MS) return data;
  } catch { /* ignore */ }
  return null;
}
function writeCache(user: string, data: GitHubData): void {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ user, at: Date.now(), data })); } catch { /* ignore */ }
}
```

- [ ] **Step 4: Run source test to verify it passes**

Run: `npx vitest run src/data/sources/githubSource.test.ts`
Expected: PASS.

- [ ] **Step 5: Write the failing widget test**

`src/widgets/GitHub/GitHubWidget.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GitHubView } from "./GitHubWidget";

describe("GitHubView", () => {
  it("renders the total commit count", () => {
    render(
      <GitHubView
        state="ready"
        expanded={false}
        data={{ totalCommits: 37, perDay: [{ day: "Mon", commits: 5 }] }}
      />
    );
    expect(screen.getByText("37")).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run src/widgets/GitHub/GitHubWidget.test.tsx`
Expected: FAIL.

- [ ] **Step 7: Write the widget**

`src/widgets/GitHub/GitHubWidget.tsx`:
```tsx
import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import type { WidgetViewProps } from "../types";
import type { WidgetDataResult } from "../../data/types";
import { fetchGitHubActivity, type GitHubData } from "../../data/sources/githubSource";

const GITHUB_USER = "octocat"; // change to your username

export function GitHubView({ data, state }: WidgetViewProps<GitHubData>) {
  if (state !== "ready" || !data) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-2xl font-bold text-accent-amber">{data.totalCommits}</span>
      <span className="text-xs text-text-muted">commits this week</span>
      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.perDay}>
            <Area type="monotone" dataKey="commits" stroke="#ffc879" fill="#ffc87955" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function useGitHubData(): WidgetDataResult<GitHubData> {
  const [result, setResult] = useState<WidgetDataResult<GitHubData>>({ state: "loading", data: null });
  useEffect(() => {
    let active = true;
    fetchGitHubActivity(GITHUB_USER)
      .then((d) => active && setResult({ state: "ready", data: d }))
      .catch((e) => active && setResult({ state: "error", data: null, error: String(e.message ?? e) }));
    return () => { active = false; };
  }, []);
  return result;
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run src/widgets/GitHub/GitHubWidget.test.tsx`
Expected: PASS.

- [ ] **Step 9: Register + commit**

Add to `registry.ts`:
```ts
import { GitHubView, useGitHubData } from "./GitHub/GitHubWidget";
{
  id: "github",
  name: "GitHub",
  accent: "amber",
  defaultSize: { w: 2, h: 2 },
  minSize: { w: 2, h: 2 },
  Component: GitHubView as WidgetDefinition["Component"],
  useData: useGitHubData as WidgetDefinition["useData"],
},
```
```bash
npx vitest run src/widgets/registry.test.ts
git add -A && git commit -m "feat: add GitHub widget with cached, rate-limit-aware source"
```

### Task 2.4: Calendar widget (mock)

**Files:**
- Create: `src/data/sources/calendarSource.ts`
- Create: `src/widgets/Calendar/CalendarWidget.tsx`
- Test: `src/widgets/Calendar/CalendarWidget.test.tsx`
- Modify: `src/widgets/registry.ts`

- [ ] **Step 1: Write the failing test**

`src/widgets/Calendar/CalendarWidget.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalendarView } from "./CalendarWidget";

describe("CalendarView", () => {
  it("renders the next event time and title", () => {
    render(
      <CalendarView
        state="ready"
        expanded={false}
        data={{ events: [{ id: "1", time: "9:30", title: "Standup" }] }}
      />
    );
    expect(screen.getByText("9:30")).toBeInTheDocument();
    expect(screen.getByText("Standup")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/widgets/Calendar/CalendarWidget.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write the mock source**

`src/data/sources/calendarSource.ts`:
```ts
// MOCK. Replace with Google Calendar API later — return the same CalendarEvent[] shape.
export interface CalendarEvent { id: string; time: string; title: string; }

export function getMockEvents(): CalendarEvent[] {
  return [
    { id: "1", time: "9:30", title: "Standup" },
    { id: "2", time: "11:00", title: "Design review" },
    { id: "3", time: "15:00", title: "1:1 with Sam" },
  ];
}
```

- [ ] **Step 4: Write the widget**

`src/widgets/Calendar/CalendarWidget.tsx`:
```tsx
import type { WidgetViewProps } from "../types";
import type { WidgetDataResult } from "../../data/types";
import { getMockEvents, type CalendarEvent } from "../../data/sources/calendarSource";

export interface CalendarData { events: CalendarEvent[]; }

export function CalendarView({ data, state }: WidgetViewProps<CalendarData>) {
  if (state !== "ready" || !data) return null;
  return (
    <ul className="flex flex-col gap-2">
      {data.events.map((e) => (
        <li key={e.id} className="flex items-baseline gap-3">
          <span className="text-sm font-semibold text-accent-violet">{e.time}</span>
          <span className="text-sm text-text-bright">{e.title}</span>
        </li>
      ))}
    </ul>
  );
}

export function useCalendarData(): WidgetDataResult<CalendarData> {
  const events = getMockEvents();
  return { state: events.length ? "ready" : "empty", data: { events } };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/widgets/Calendar/CalendarWidget.test.tsx`
Expected: PASS.

- [ ] **Step 6: Register + commit**

Add to `registry.ts`:
```ts
import { CalendarView, useCalendarData } from "./Calendar/CalendarWidget";
{
  id: "calendar",
  name: "Calendar",
  accent: "violet",
  defaultSize: { w: 2, h: 2 },
  minSize: { w: 2, h: 2 },
  Component: CalendarView as WidgetDefinition["Component"],
  useData: useCalendarData as WidgetDefinition["useData"],
},
```
```bash
npx vitest run src/widgets/registry.test.ts
git add -A && git commit -m "feat: add Calendar widget (mock source)"
```

### Task 2.5: Mail widget (mock)

**Files:**
- Create: `src/data/sources/mailSource.ts`
- Create: `src/widgets/Mail/MailWidget.tsx`
- Test: `src/widgets/Mail/MailWidget.test.tsx`
- Modify: `src/widgets/registry.ts`

- [ ] **Step 1: Write the failing test**

`src/widgets/Mail/MailWidget.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MailView } from "./MailWidget";

describe("MailView", () => {
  it("renders unread count and urgent count", () => {
    render(
      <MailView
        state="ready"
        expanded={false}
        data={{ unread: 12, urgent: 2, senders: ["Sam", "GitHub"] }}
      />
    );
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText(/2 urgent/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/widgets/Mail/MailWidget.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write the mock source**

`src/data/sources/mailSource.ts`:
```ts
// MOCK. Replace with Gmail API later — return the same MailData shape.
export interface MailData { unread: number; urgent: number; senders: string[]; }

export function getMockMail(): MailData {
  return { unread: 12, urgent: 2, senders: ["Sam", "GitHub", "Stripe"] };
}
```

- [ ] **Step 4: Write the widget**

`src/widgets/Mail/MailWidget.tsx`:
```tsx
import type { WidgetViewProps } from "../types";
import type { WidgetDataResult } from "../../data/types";
import { getMockMail, type MailData } from "../../data/sources/mailSource";

export function MailView({ data, state }: WidgetViewProps<MailData>) {
  if (state !== "ready" || !data) return null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold text-accent-coral">{data.unread}</span>
        <span className="text-xs font-semibold text-accent-coral">{data.urgent} urgent</span>
      </div>
      <span className="text-xs text-text-muted">unread</span>
      <span className="text-xs text-text-muted">{data.senders.join(", ")}…</span>
    </div>
  );
}

export function useMailData(): WidgetDataResult<MailData> {
  return { state: "ready", data: getMockMail() };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/widgets/Mail/MailWidget.test.tsx`
Expected: PASS.

- [ ] **Step 6: Register + commit**

Add to `registry.ts`:
```ts
import { MailView, useMailData } from "./Mail/MailWidget";
{
  id: "mail",
  name: "Mail",
  accent: "coral",
  defaultSize: { w: 2, h: 2 },
  minSize: { w: 2, h: 2 },
  Component: MailView as WidgetDefinition["Component"],
  useData: useMailData as WidgetDefinition["useData"],
},
```
```bash
npx vitest run src/widgets/registry.test.ts
git add -A && git commit -m "feat: add Mail widget (mock source)"
```

### Task 2.6: GCP widget (mock, donut chart)

**Files:**
- Create: `src/data/sources/gcpSource.ts`
- Create: `src/widgets/GCP/GcpWidget.tsx`
- Test: `src/widgets/GCP/GcpWidget.test.tsx`
- Modify: `src/widgets/registry.ts`

- [ ] **Step 1: Write the failing test**

`src/widgets/GCP/GcpWidget.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GcpView } from "./GcpWidget";

describe("GcpView", () => {
  it("renders spend and budget percentage", () => {
    render(
      <GcpView
        state="ready"
        expanded={false}
        data={{ spend: 612, budget: 1000, breakdown: [{ name: "Compute", value: 400 }] }}
      />
    );
    expect(screen.getByText("$612")).toBeInTheDocument();
    expect(screen.getByText(/61%/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/widgets/GCP/GcpWidget.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write the mock source**

`src/data/sources/gcpSource.ts`:
```ts
// MOCK. Replace with GCP Billing/Monitoring APIs later — return the same GcpData shape.
export interface GcpData {
  spend: number;
  budget: number;
  breakdown: { name: string; value: number }[];
}

export function getMockGcp(): GcpData {
  return {
    spend: 612,
    budget: 1000,
    breakdown: [
      { name: "Compute", value: 400 },
      { name: "Storage", value: 150 },
      { name: "Network", value: 62 },
    ],
  };
}
```

- [ ] **Step 4: Write the widget**

`src/widgets/GCP/GcpWidget.tsx`:
```tsx
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { WidgetViewProps } from "../types";
import type { WidgetDataResult } from "../../data/types";
import { getMockGcp, type GcpData } from "../../data/sources/gcpSource";

const COLORS = ["#5fe0c8", "#c2a6ff", "#ffc879"];

export function GcpView({ data, state }: WidgetViewProps<GcpData>) {
  if (state !== "ready" || !data) return null;
  const pct = Math.round((data.spend / data.budget) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="h-20 w-20">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data.breakdown} dataKey="value" innerRadius={22} outerRadius={34} paddingAngle={2}>
              {data.breakdown.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold text-accent-teal">${data.spend}</span>
        <span className="text-xs text-text-muted">{pct}% of ${data.budget}</span>
      </div>
    </div>
  );
}

export function useGcpData(): WidgetDataResult<GcpData> {
  return { state: "ready", data: getMockGcp() };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/widgets/GCP/GcpWidget.test.tsx`
Expected: PASS.

- [ ] **Step 6: Register + commit**

Add to `registry.ts`:
```ts
import { GcpView, useGcpData } from "./GCP/GcpWidget";
{
  id: "gcp",
  name: "GCP",
  accent: "teal",
  defaultSize: { w: 2, h: 2 },
  minSize: { w: 2, h: 2 },
  Component: GcpView as WidgetDefinition["Component"],
  useData: useGcpData as WidgetDefinition["useData"],
},
```
```bash
npx vitest run src/widgets/registry.test.ts
git add -A && git commit -m "feat: add GCP widget (mock source, donut chart)"
```

### Task 2.7: Full manual check of all widgets

- [ ] **Step 1: Typecheck + run all tests**

Run: `npx tsc --noEmit && npm test`
Expected: all tests pass.

- [ ] **Step 2: Run the app, verify all 7 widgets render, drag, resize, persist**

Run: `npm run dev`
Expected: Clock, Todos, Weather (live), GitHub (live, or graceful error if rate-limited), Calendar, Mail, GCP all appear, draggable + resizable, layout persists across reload.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A && git commit -m "test: verify all widgets render and persist" --allow-empty
```

---

### Task 2.8: GitHub contributions heatmap (added 2026-05-31, user request)

> Full-year contribution calendar (the green-squares board) shown in the GitHub widget's **expanded** state. Data comes from GitHub GraphQL `contributionsCollection.contributionCalendar`, which needs auth — so the token is kept **server-side** in a Vite dev-server proxy (NOT a `VITE_`-prefixed var, which would leak into the client bundle). Username: `its-dreOwO`.

**Files:**
- Modify: `vite.config.ts` (add a dev-server middleware plugin for `/api/contributions`)
- Create: `.env.example` (documents `GITHUB_TOKEN=`)
- Create: `src/data/sources/contributionsSource.ts` + test
- Create: `src/components/ContributionHeatmap.tsx` + test
- Modify: `src/widgets/GitHub/GitHubWidget.tsx` (render heatmap when `expanded`; set username)
- Modify: `.gitignore` already ignores `.env` (done)

**Approach:**
1. **Dev proxy:** a Vite plugin with `configureServer` registering middleware for `/api/contributions`. Reads `GITHUB_TOKEN` via `loadEnv`, POSTs to `https://api.github.com/graphql` with the `contributionsCollection(from,to){ contributionCalendar { totalContributions weeks { contributionDays { date contributionCount contributionLevel } } } }` query for `its-dreOwO`, returns the calendar JSON. Friendly 500 if token missing.
2. **Source:** `fetchContributions(): Promise<ContributionData>` calls `/api/contributions`, maps to `{ totalContributions, weeks: { date: string; count: number; level: 0|1|2|3|4 }[][] }` (GraphQL levels NONE/FIRST_QUARTILE/… → 0–4). Throws friendly errors.
3. **Component:** `ContributionHeatmap({ weeks, total })` — week columns × 7 weekday rows of rounded cells colored by level (theme greens, `accent-green` family), month labels across the top, "Less → More" legend. Pure/prop-driven; unit-tested with a small fixture.
4. **Wire:** `GitHubView` keeps the sparkline when `!expanded`; when `expanded`, render `ContributionHeatmap`. Add a `useContributionsData()` hook (loading→ready/error) — only fetched when needed. Set `GITHUB_USER = "its-dreOwO"`.
5. Verify with `npm run build` + vitest. Manual expand verification deferred to Task 3.3 (ExpandOverlay). Commit (stage only the touched files).

---

## Phase 3 — Animation, dynamic states, add/remove

### Task 3.1: AnimatedNumber count-up

**Files:**
- Create: `src/components/AnimatedNumber.tsx`
- Test: `src/components/AnimatedNumber.test.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/AnimatedNumber.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnimatedNumber } from "./AnimatedNumber";

describe("AnimatedNumber", () => {
  it("renders the final value (and optional prefix/suffix)", () => {
    render(<AnimatedNumber value={37} prefix="$" />);
    // jsdom has no rAF animation; component must render the target value synchronously as fallback
    expect(screen.getByText(/\$?37/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/AnimatedNumber.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write implementation**

`src/components/AnimatedNumber.tsx`:
```tsx
import { useEffect } from "react";
import { animate, useMotionValue, useTransform, motion } from "framer-motion";

interface Props { value: number; prefix?: string; suffix?: string; }

export function AnimatedNumber({ value, prefix = "", suffix = "" }: Props) {
  const mv = useMotionValue(value);
  const rounded = useTransform(mv, (v) => `${prefix}${Math.round(v)}${suffix}`);
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.8, ease: "easeOut" });
    return controls.stop;
  }, [value, mv]);
  return <motion.span>{rounded}</motion.span>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/AnimatedNumber.test.tsx`
Expected: PASS. (Framer initializes the motion value to `value`, so the text is present immediately.)

- [ ] **Step 5: Wire into GitHub + GCP + Mail key numbers**

In `GitHubWidget.tsx` replace `{data.totalCommits}` with `<AnimatedNumber value={data.totalCommits} />`.
In `GcpWidget.tsx` replace `${data.spend}` with `<AnimatedNumber value={data.spend} prefix="$" />`.
In `MailWidget.tsx` replace `{data.unread}` with `<AnimatedNumber value={data.unread} />`.

- [ ] **Step 6: Run affected tests + commit**

```bash
npx vitest run src/widgets/GitHub src/widgets/GCP src/widgets/Mail
git add -A && git commit -m "feat: animate key numbers with count-up"
```

### Task 3.2: Entrance + drag/hover motion on widgets

**Files:**
- Modify: `src/components/DashboardGrid.tsx`

- [ ] **Step 1: Wrap each grid child in a motion container**

In `DashboardGrid.tsx`, import motion and wrap the inner `drag-handle` div content. The grid item `<div key={w.id}>` MUST remain a plain div (react-grid-layout sets its transform). Apply Framer ONLY to the inner content:

```tsx
import { motion } from "framer-motion";
// ...
{visible.map((w) => (
  <div key={w.id}>
    <motion.div
      className="drag-handle h-full w-full cursor-move"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.25 }}
    >
      <WidgetHost def={w} />
    </motion.div>
  </div>
))}
```

- [ ] **Step 2: Typecheck + run app**

Run: `npx tsc --noEmit && npm run dev`
Expected: widgets fade/slide in on load, lift slightly on hover; drag and resize still work (no transform fighting because `layout` prop is not used on grid items).

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add entrance and hover motion to widgets"
```

### Task 3.3: ExpandOverlay (click-to-expand detail)

**Files:**
- Create: `src/components/ExpandOverlay.tsx`
- Test: `src/components/ExpandOverlay.test.tsx`
- Modify: `src/components/WidgetFrame.tsx`
- Modify: `src/components/WidgetHost.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/ExpandOverlay.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpandOverlay } from "./ExpandOverlay";

describe("ExpandOverlay", () => {
  it("renders children and calls onClose when backdrop clicked", async () => {
    const onClose = vi.fn();
    render(<ExpandOverlay title="Weather" onClose={onClose}>detail</ExpandOverlay>);
    expect(screen.getByText("detail")).toBeInTheDocument();
    await userEvent.click(screen.getByTestId("overlay-backdrop"));
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ExpandOverlay.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write implementation**

`src/components/ExpandOverlay.tsx`:
```tsx
import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface Props { title: string; onClose: () => void; children: ReactNode; }

export function ExpandOverlay({ title, onClose, children }: Props) {
  return (
    <motion.div
      data-testid="overlay-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-8"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-bg-raised p-6"
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h2 className="mb-4 text-lg font-semibold text-text-bright">{title}</h2>
        {children}
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ExpandOverlay.test.tsx`
Expected: PASS.

- [ ] **Step 5: Add an expand affordance in `WidgetFrame`**

Add an "expand" button to the `WidgetFrame` header and an `onExpand?: () => void` prop:
```tsx
// add to Props: onExpand?: () => void;
// in the header row, after the title span:
{onExpand && (
  <button onClick={onExpand} className="text-xs text-text-muted hover:text-text-bright" aria-label="Expand">⤢</button>
)}
```

- [ ] **Step 6: Wire expand state in `WidgetHost`**

```tsx
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { ExpandOverlay } from "./ExpandOverlay";
// ...
export function WidgetHost({ def }: { def: WidgetDefinition }) {
  const result = def.useData();
  const Component = def.Component;
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <WidgetFrame title={def.name} accent={def.accent} state={result.state} error={result.error} onExpand={() => setExpanded(true)}>
        <Component data={result.data} state={result.state} expanded={false} />
      </WidgetFrame>
      <AnimatePresence>
        {expanded && (
          <ExpandOverlay title={def.name} onClose={() => setExpanded(false)}>
            <Component data={result.data} state={result.state} expanded={true} />
          </ExpandOverlay>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 7: Run tests + typecheck + commit**

```bash
npx vitest run src/components && npx tsc --noEmit
git add -A && git commit -m "feat: add click-to-expand widget overlay"
```

### Task 3.4: AddWidgetMenu (add/remove widgets)

**Files:**
- Create: `src/components/AddWidgetMenu.tsx`
- Test: `src/components/AddWidgetMenu.test.tsx`
- Modify: `src/components/DashboardGrid.tsx`

- [ ] **Step 1: Write the failing test**

`src/components/AddWidgetMenu.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddWidgetMenu } from "./AddWidgetMenu";

describe("AddWidgetMenu", () => {
  it("lists hidden widgets and calls onAdd when one is picked", async () => {
    const onAdd = vi.fn();
    render(<AddWidgetMenu hiddenIds={["mail"]} onAdd={onAdd} />);
    await userEvent.click(screen.getByRole("button", { name: /add widget/i }));
    await userEvent.click(screen.getByText("Mail"));
    expect(onAdd).toHaveBeenCalledWith("mail");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/AddWidgetMenu.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Write implementation**

`src/components/AddWidgetMenu.tsx`:
```tsx
import { useState } from "react";
import { registry } from "../widgets/registry";

interface Props { hiddenIds: string[]; onAdd: (id: string) => void; }

export function AddWidgetMenu({ hiddenIds, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const hidden = registry.filter((w) => hiddenIds.includes(w.id));
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg border border-white/10 bg-card px-3 py-1.5 text-sm text-text-bright"
      >
        + Add widget
      </button>
      {open && (
        <ul className="absolute right-0 mt-2 w-44 rounded-lg border border-white/10 bg-bg-raised p-1">
          {hidden.length === 0 && <li className="px-3 py-2 text-xs text-text-muted">All widgets shown</li>}
          {hidden.map((w) => (
            <li key={w.id}>
              <button
                onClick={() => { onAdd(w.id); setOpen(false); }}
                className="block w-full rounded px-3 py-2 text-left text-sm text-text-bright hover:bg-white/5"
              >
                {w.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/AddWidgetMenu.test.tsx`
Expected: PASS.

- [ ] **Step 5: Wire add/remove into `DashboardGrid`**

In `DashboardGrid.tsx`:
- Render `<AddWidgetMenu hiddenIds={registry.filter(w => !layout.some(l => l.i === w.id)).map(w => w.id)} onAdd={addWidget} />` above the grid.
- Add `addWidget(id)`: append a new `Layout` item using that widget's `defaultSize`/`minSize` at `{ x: 0, y: Infinity }` (RGL places it at the bottom), then `setLayout`.
- Add a small "×" remove button per widget (in `WidgetFrame` header, like `onExpand`) wired through `WidgetHost` to a `onRemove` prop that filters the layout.

Concretely add to `DashboardGrid.tsx`:
```tsx
import { AddWidgetMenu } from "./AddWidgetMenu";
// inside DashboardGrid, before return:
const addWidget = (id: string) => {
  const def = registry.find((w) => w.id === id)!;
  setLayout([
    ...layout,
    { i: id, x: 0, y: Infinity, w: def.defaultSize.w, h: def.defaultSize.h, minW: def.minSize.w, minH: def.minSize.h },
  ]);
};
const removeWidget = (id: string) => setLayout(layout.filter((l) => l.i !== id));
```
Pass `onRemove={() => removeWidget(w.id)}` down through `WidgetHost` → `WidgetFrame` (add the prop + a "×" button mirroring the expand button).

- [ ] **Step 6: Typecheck + run app + commit**

Run: `npx tsc --noEmit && npm run dev`
Expected: can remove a widget (disappears, layout persists) and re-add it from the menu.
```bash
git add -A && git commit -m "feat: add/remove widgets via menu"
```

### Task 3.5: README + final verification

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write `README.md`**

Document: what it is, `npm install` / `npm run dev` / `npm test`, where to set `GITHUB_USER` (GitHubWidget.tsx) and weather `LAT`/`LON` (WeatherWidget.tsx), the GitHub 60 req/hr note, and how to add a new widget (create `*View` + `use*Data`, add a registry entry).

- [ ] **Step 2: Full verification**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: typecheck clean, all tests pass, production build succeeds.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "docs: add README with setup and widget-authoring guide"
```

---

## Phase 4 — LUMIX AI Copilot

### Task 4.1: Centralize Widget Data (`DashboardDataContext`)

**Files:**
- Create: `src/context/DashboardDataContext.tsx`
- Test: `src/context/DashboardDataContext.test.tsx`
- Modify: `src/components/WidgetHost.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/context/DashboardDataContext.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useContext } from "react";
import { DashboardDataProvider, DashboardDataContext } from "./DashboardDataContext";

function TestConsumer() {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) return null;
  return (
    <div>
      <div data-testid="data-length">{Object.keys(ctx.widgetsData).length}</div>
      <button
        onClick={() => ctx.updateWidgetData("test-id", "Test Widget", "ready", { foo: "bar" })}
      >
        Update
      </button>
      <div data-testid="widget-val">{ctx.widgetsData["test-id"]?.data?.foo}</div>
    </div>
  );
}

describe("DashboardDataContext", () => {
  it("manages and updates widget state correctly", () => {
    render(
      <DashboardDataProvider>
        <TestConsumer />
      </DashboardDataProvider>
    );
    expect(screen.getByTestId("data-length")).toHaveTextContent("0");
    screen.getByText("Update").click();
    expect(screen.getByTestId("data-length")).toHaveTextContent("1");
    expect(screen.getByTestId("widget-val")).toHaveTextContent("bar");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/context/DashboardDataContext.test.tsx`
Expected: FAIL (files do not exist yet)

- [ ] **Step 3: Write minimal implementation**

Create `src/context/DashboardDataContext.tsx`:
```tsx
import React, { createContext, useContext, useState, useCallback } from "react";

export interface WidgetDataState {
  id: string;
  name: string;
  state: "loading" | "ready" | "empty" | "error";
  data: any;
  error?: string;
}

interface DashboardDataContextType {
  widgetsData: Record<string, WidgetDataState>;
  updateWidgetData: (id: string, name: string, state: WidgetDataState["state"], data: any, error?: string) => void;
}

export const DashboardDataContext = createContext<DashboardDataContextType | null>(null);

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const [widgetsData, setWidgetsData] = useState<Record<string, WidgetDataState>>({});

  const updateWidgetData = useCallback(
    (id: string, name: string, state: WidgetDataState["state"], data: any, error?: string) => {
      setWidgetsData((prev) => {
        const existing = prev[id];
        if (
          existing &&
          existing.state === state &&
          existing.data === data &&
          existing.error === error
        ) {
          return prev;
        }
        return {
          ...prev,
          [id]: { id, name, state, data, error },
        };
      });
    },
    []
  );

  return (
    <DashboardDataContext.Provider value={{ widgetsData, updateWidgetData }}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error("useDashboardData must be used within a DashboardDataProvider");
  }
  return context;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/context/DashboardDataContext.test.tsx`
Expected: PASS

- [ ] **Step 5: Wire into WidgetHost and App**

Modify `src/components/WidgetHost.tsx` to update context on render:
```tsx
import { useEffect } from "react";
import type { WidgetDefinition } from "../widgets/types";
import { WidgetFrame } from "./WidgetFrame";
import { useDashboardData } from "../context/DashboardDataContext";

export function WidgetHost({ def }: { def: WidgetDefinition }) {
  const result = def.useData();
  const Component = def.Component;
  const { updateWidgetData } = useDashboardData();

  useEffect(() => {
    updateWidgetData(def.id, def.name, result.state, result.data, result.error);
  }, [def.id, def.name, result.state, result.data, result.error, updateWidgetData]);

  return (
    <WidgetFrame title={def.name} accent={def.accent} state={result.state} error={result.error}>
      <Component data={result.data} state={result.state} expanded={false} />
    </WidgetFrame>
  );
}
```

Modify `src/App.tsx` to wrap main layout inside `DashboardDataProvider`:
```tsx
import { DashboardGrid } from "./components/DashboardGrid";
import { DashboardDataProvider } from "./context/DashboardDataContext";

export default function App() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return (
    <DashboardDataProvider>
      <main className="mx-auto max-w-[1120px] p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-text-bright">{greeting}, Dre</h1>
          <p className="text-sm text-text-muted">
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </header>
        <DashboardGrid />
      </main>
    </DashboardDataProvider>
  );
}
```

- [ ] **Step 6: Run affected tests and commit**

Run: `npm test`
Expected: all tests pass.
```bash
git add src/context/DashboardDataContext.tsx src/context/DashboardDataContext.test.tsx src/components/WidgetHost.tsx src/App.tsx
git commit -m "feat: centralize widget data reporting via DashboardDataContext"
```

---

### Task 4.2: OpenRouter API Integration Client (`src/lib/openrouter.ts`)

**Files:**
- Create: `src/lib/openrouter.ts`
- Test: `src/lib/openrouter.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/openrouter.test.ts`:
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchLUMIXBriefing, askLUMIX } from "./openrouter";

describe("openrouter client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("sends request with system prompt & custom model", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Good morning! It's clear outside." } }],
      }),
    } as any);

    const result = await fetchLUMIXBriefing("key-123", { weather: { id: "weather", name: "Weather", state: "ready", data: { temp: 18 } } });
    expect(result).toBe("Good morning! It's clear outside.");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer key-123",
        }),
      })
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/openrouter.test.ts`
Expected: FAIL (files do not exist yet)

- [ ] **Step 3: Write implementation**

Create `src/lib/openrouter.ts`:
```typescript
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function callOpenRouter(apiKey: string, messages: ChatMessage[]): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "Morning Dashboard",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-v4-flash",
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText} (${response.status})`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  if (!content) throw new Error("Invalid response format from OpenRouter");
  return content;
}

export async function fetchLUMIXBriefing(apiKey: string, widgetsData: Record<string, any>): Promise<string> {
  const systemPrompt = `You are LUMIX, the user's personal morning AI assistant. You are helping them analyze their dashboard.
Here is the current real-time data displayed on their dashboard widgets:
${JSON.stringify(widgetsData, null, 2)}

Provide a warm, super-concise daily briefing (2-3 sentences max). Highlight critical items like weather warnings, calendar events, or system alerts.`;

  return callOpenRouter(apiKey, [{ role: "system", content: systemPrompt }]);
}

export async function askLUMIX(apiKey: string, widgetsData: Record<string, any>, chatHistory: ChatMessage[]): Promise<string> {
  const systemPrompt = `You are LUMIX, the user's personal morning AI assistant. You are helping them analyze their dashboard.
Here is the current real-time data displayed on their dashboard widgets:
${JSON.stringify(widgetsData, null, 2)}

Provide helpful, context-aware answers based on this data. If the user asks something outside the dashboard context, reply politely and bring the focus back. Keep answers brief and conversational.`;

  return callOpenRouter(apiKey, [
    { role: "system", content: systemPrompt },
    ...chatHistory,
  ]);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/openrouter.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/openrouter.ts src/lib/openrouter.test.ts
git commit -m "feat: implement openrouter API client for LUMIX briefings and chats"
```

---

### Task 4.3: Briefing & API Setup Card (`AiBriefingCard`)

**Files:**
- Create: `src/components/AiBriefingCard.tsx`
- Test: `src/components/AiBriefingCard.test.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/AiBriefingCard.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AiBriefingCard } from "./AiBriefingCard";
import { DashboardDataProvider } from "../context/DashboardDataContext";

describe("AiBriefingCard", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("shows API key configuration input when key is missing", () => {
    render(
      <DashboardDataProvider>
        <AiBriefingCard onOpenChat={() => {}} />
      </DashboardDataProvider>
    );
    expect(screen.getByPlaceholderText(/Enter OpenRouter API Key/i)).toBeInTheDocument();
  });

  it("renders loading and then briefing once key is saved", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "LUMIX morning summary here." } }],
      }),
    } as any);

    render(
      <DashboardDataProvider>
        <AiBriefingCard onOpenChat={() => {}} />
      </DashboardDataProvider>
    );

    const input = screen.getByPlaceholderText(/Enter OpenRouter API Key/i);
    fireEvent.change(input, { target: { value: "test-api-key" } });
    fireEvent.click(screen.getByText(/Save/i));

    await waitFor(() => {
      expect(screen.getByText("LUMIX morning summary here.")).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/AiBriefingCard.test.tsx`
Expected: FAIL (files do not exist yet)

- [ ] **Step 3: Write implementation**

Create `src/components/AiBriefingCard.tsx`:
```tsx
import { useState, useEffect } from "react";
import { useDashboardData } from "../context/DashboardDataContext";
import { fetchLUMIXBriefing } from "../lib/openrouter";

interface Props {
  onOpenChat: (initialMsg?: string) => void;
}

export function AiBriefingCard({ onOpenChat }: Props) {
  const { widgetsData } = useDashboardData();
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("dashboard.openrouter_api_key") || "");
  const [keyInput, setKeyInput] = useState("");
  const [briefing, setBriefing] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quickInput, setQuickInput] = useState("");

  useEffect(() => {
    if (!apiKey) return;

    let active = true;
    const loadBriefing = async () => {
      setLoading(true);
      setError("");
      try {
        const text = await fetchLUMIXBriefing(apiKey, widgetsData);
        if (active) setBriefing(text);
      } catch (err: any) {
        if (active) setError(err.message || "Failed to load briefing");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBriefing();
    return () => { active = false; };
  }, [apiKey, widgetsData]);

  const handleSaveKey = () => {
    if (!keyInput.trim()) return;
    localStorage.setItem("dashboard.openrouter_api_key", keyInput.trim());
    setApiKey(keyInput.trim());
  };

  const handleClearKey = () => {
    localStorage.removeItem("dashboard.openrouter_api_key");
    setApiKey("");
    setBriefing("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && quickInput.trim()) {
      onOpenChat(quickInput);
      setQuickInput("");
    }
  };

  if (!apiKey) {
    return (
      <div className="bg-card-surface border border-white/10 backdrop-blur p-4 rounded-xl max-w-sm w-full">
        <h4 className="text-xs font-semibold text-text-bright uppercase tracking-wider mb-2">✨ LUMIX Briefing Setup</h4>
        <p className="text-xs text-text-muted mb-3">Provide your OpenRouter API key to activate LUMIX briefings.</p>
        <div className="flex gap-2">
          <input
            type="password"
            placeholder="Enter OpenRouter API Key"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            className="flex-1 bg-black/20 border border-white/10 rounded px-2 py-1 text-xs text-text-bright focus:outline-none focus:border-accent-amber/50"
          />
          <button
            onClick={handleSaveKey}
            className="bg-accent-amber text-bg-deep font-semibold text-xs px-3 py-1 rounded hover:bg-accent-amber/90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card-surface border border-white/10 backdrop-blur p-4 rounded-xl max-w-md w-full flex flex-col justify-between min-h-[120px] transition-all duration-300">
      <div>
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-xs font-semibold text-accent-amber uppercase tracking-wider flex items-center gap-1">
            <span>✨</span> LUMIX Briefing
          </h4>
          <button onClick={handleClearKey} className="text-[10px] text-text-muted hover:text-text-bright hover:underline">
            Disconnect
          </button>
        </div>
        {loading ? (
          <div className="space-y-2 py-2" data-testid="briefing-skeleton">
            <div className="h-3 bg-white/5 rounded animate-pulse w-full"></div>
            <div className="h-3 bg-white/5 rounded animate-pulse w-5/6"></div>
          </div>
        ) : error ? (
          <p className="text-xs text-coral font-medium py-1">⚠️ {error}</p>
        ) : (
          <p className="text-xs text-text-muted leading-relaxed py-1">{briefing || "Waiting for dashboard widgets to finish loading..."}</p>
        )}
      </div>

      <div className="mt-3 flex gap-2 border-t border-white/5 pt-2">
        <input
          type="text"
          placeholder="Ask LUMIX anything about today..."
          value={quickInput}
          onChange={(e) => setQuickInput(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-grow bg-black/20 border border-white/10 rounded px-2.5 py-1.5 text-xs text-text-bright placeholder-text-muted/65 focus:outline-none focus:border-accent-amber/50"
        />
        <button
          onClick={() => {
            onOpenChat(quickInput);
            setQuickInput("");
          }}
          className="bg-accent-amber/15 hover:bg-accent-amber/25 border border-accent-amber/30 text-accent-amber font-semibold text-xs px-3 py-1 rounded transition-colors"
        >
          Chat
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/AiBriefingCard.test.tsx`
Expected: PASS

- [ ] **Step 5: Wire into App**

Modify `src/App.tsx`:
```tsx
import { useState } from "react";
import { DashboardGrid } from "./components/DashboardGrid";
import { DashboardDataProvider } from "./context/DashboardDataContext";
import { AiBriefingCard } from "./components/AiBriefingCard";
import { CopilotSidebar } from "./components/CopilotSidebar";

export default function App() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState("");

  const handleOpenChat = (prompt?: string) => {
    if (prompt) setInitialPrompt(prompt);
    setSidebarOpen(true);
  };

  return (
    <DashboardDataProvider>
      <div className="relative min-h-screen overflow-x-hidden">
        <main className="mx-auto max-w-[1120px] p-6">
          <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-text-bright">{greeting}, Dre</h1>
              <p className="text-sm text-text-muted">
                {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <AiBriefingCard onOpenChat={handleOpenChat} />
          </header>
          <DashboardGrid />
        </main>
        <CopilotSidebar
          isOpen={sidebarOpen}
          initialPrompt={initialPrompt}
          onClose={() => {
            setSidebarOpen(false);
            setInitialPrompt("");
          }}
        />
      </div>
    </DashboardDataProvider>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/AiBriefingCard.tsx src/components/AiBriefingCard.test.tsx src/App.tsx
git commit -m "feat: add glassmorphic AiBriefingCard next to greeting in header"
```

---

### Task 4.4: Copilot Sidebar Conversation Drawer (`CopilotSidebar`)

**Files:**
- Create: `src/components/CopilotSidebar.tsx`
- Test: `src/components/CopilotSidebar.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/CopilotSidebar.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CopilotSidebar } from "./CopilotSidebar";
import { DashboardDataProvider } from "../context/DashboardDataContext";

describe("CopilotSidebar", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <DashboardDataProvider>
        <CopilotSidebar isOpen={false} initialPrompt="" onClose={() => {}} />
      </DashboardDataProvider>
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders conversation flow and appends messages", async () => {
    localStorage.setItem("dashboard.openrouter_api_key", "test-key");
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "I can help with Weather data." } }],
      }),
    } as any);

    render(
      <DashboardDataProvider>
        <CopilotSidebar isOpen={true} initialPrompt="How is the weather?" onClose={() => {}} />
      </DashboardDataProvider>
    );

    expect(screen.getByText("How is the weather?")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("I can help with Weather data.")).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/CopilotSidebar.test.tsx`
Expected: FAIL (files do not exist yet)

- [ ] **Step 3: Write implementation**

Create `src/components/CopilotSidebar.tsx`:
```tsx
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useDashboardData } from "../context/DashboardDataContext";
import { askLUMIX, type ChatMessage } from "../lib/openrouter";

interface Props {
  isOpen: boolean;
  initialPrompt: string;
  onClose: () => void;
}

export function CopilotSidebar({ isOpen, initialPrompt, onClose }: Props) {
  const { widgetsData } = useDashboardData();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const apiKey = localStorage.getItem("dashboard.openrouter_api_key") || "";
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setError("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialPrompt && apiKey) {
      handleSendMessage(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !apiKey || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const responseText = await askLUMIX(apiKey, widgetsData, nextMessages);
      setMessages([...nextMessages, { role: "assistant", content: responseText }]);
    } catch (err: any) {
      setError(err.message || "Failed to communicate with LUMIX");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage(input);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-40"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-bg-deep border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-bg-raised">
              <div className="flex items-center gap-2">
                <span className="text-base">✨</span>
                <h3 className="text-sm font-semibold text-text-bright">LUMIX Copilot Chat</h3>
              </div>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-bright transition-colors text-sm px-2 py-1 rounded"
              >
                Close
              </button>
            </div>

            <div className="flex-grow p-4 overflow-y-auto space-y-3">
              {messages.length === 0 && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <span className="text-2xl mb-2">👋</span>
                  <h4 className="text-xs font-semibold text-text-bright mb-1">Hi, I'm LUMIX</h4>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Ask me questions about your morning dashboard metrics, widgets, or daily schedule!
                  </p>
                </div>
              )}

              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    m.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <span className="text-[10px] text-text-muted mb-1 px-1">
                    {m.role === "user" ? "Dre" : "LUMIX"}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                      m.role === "user"
                        ? "bg-accent-amber text-bg-deep font-medium"
                        : "bg-white/5 border border-white/5 text-text-bright"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-text-muted mb-1 px-1">LUMIX</span>
                  <div className="bg-white/5 border border-white/5 text-text-bright max-w-[85%] rounded-lg px-3 py-2 text-xs animate-pulse">
                    Thinking...
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-coral/10 border border-coral/25 rounded-lg text-xs text-coral font-medium">
                  ⚠️ {error}
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-white/10 bg-bg-raised flex gap-2">
              <input
                type="text"
                placeholder="Ask LUMIX..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-grow bg-black/20 border border-white/10 rounded px-2.5 py-2 text-xs text-text-bright placeholder-text-muted/65 focus:outline-none focus:border-accent-amber/50"
                disabled={loading}
              />
              <button
                onClick={() => handleSendMessage(input)}
                className="bg-accent-amber text-bg-deep font-semibold text-xs px-4 py-2 rounded hover:bg-accent-amber/90 transition-colors disabled:opacity-50"
                disabled={loading || !input.trim()}
              >
                Send
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/CopilotSidebar.test.tsx`
Expected: PASS

- [ ] **Step 5: Run all tests to make sure no regressions**

Run: `npm test`
Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/CopilotSidebar.tsx src/components/CopilotSidebar.test.tsx
git commit -m "feat: add slide-out CopilotSidebar conversation drawer"
```

---

## Self-Review

**Spec coverage:**
- §2 shell/grid/persistence → Tasks 1.3, 1.8, 3.4 ✓
- §3 stack → Task 0.1 ✓
- §4 widget contract + data layer → Tasks 1.1, 1.2, 1.7; per-widget sources in Phase 2 ✓
- §5 theme tokens → Task 0.2 ✓
- §6 RGL/Framer boundary (no `layout` on grid items) → Tasks 3.2, 3.3 explicitly enforce ✓
- §6 resize-vs-autosize → minSize honored; expand is an overlay (Task 3.3), not a resize ✓
- §6 loading/empty/error → Task 1.4 ✓
- §7 seven data sources (2 live, 3 mock, 2 local) → Phase 1.5–1.6 + Phase 2 ✓
- §8 testing (contract, registry, sources, persistence, smoke renders) → throughout ✓
- §9 walking skeleton first → Phase 1 builds Weather end-to-end before fan-out ✓
- LUMIX AI Copilot & Briefings → Phase 4 (Tasks 4.1–4.4) ✓

**Placeholder scan:** No "TBD"/"handle edge cases"/"similar to" — each task has concrete code.

**Type consistency:** All shared types and contract patterns (`WidgetDataResult<T>`, `WidgetViewProps<T>`) are followed exactly. The API integration client utilizes the model `deepseek/deepseek-v4-flash` as specified.

