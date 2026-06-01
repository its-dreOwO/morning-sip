# Greeting Header and Widget Frame Redesign Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the dashboard page header into a unified 3-column glassmorphic capsule featuring an animated dot wave greeting on the left, a giant card-clipped concentric sweep clock in the center, and a slot for the LUMIX AI briefing on the right. Simultaneously, upgrade the widget frame container headers to use an uppercase accent-colored title and a dotted divider.

**Architecture:** Create a new `DashboardHeader` component that incorporates system clock state to drive the SVG Concentric rings, digital clock, date, and time-based greetings. Remove the Clock widget from the grid registry. Update `WidgetFrame` styles and classes.

**Tech Stack:** React, Tailwind CSS, SVG/CSS Keyframes, Vitest, React Testing Library.

---

## File Structure

```
src/
  components/
    DashboardHeader.tsx        New header card component (Column 1: Greeting + Wave, Column 2: Date + Sweep Clock, Column 3: AI Slot)
    WidgetFrame.tsx             Modified: uppercase title, dotted divider, neutral content area
  widgets/
    registry.ts                Modified: remove ClockWidget
  App.tsx                      Modified: render DashboardHeader
```

---

## Tasks

### Task 1: Create DashboardHeader component

**Files:**
- Create: `src/components/DashboardHeader.tsx`
- Create: `src/components/DashboardHeader.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/DashboardHeader.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardHeader } from "./DashboardHeader";

describe("DashboardHeader", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders time-based greeting for morning hours", () => {
    // 9:00 AM
    vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0));
    render(<DashboardHeader />);
    expect(screen.getByText(/Good morning,/)).toBeInTheDocument();
    expect(screen.getByText("Dre")).toHaveClass("text-accent-amber");
  });

  it("renders time-based greeting for afternoon hours", () => {
    // 3:00 PM
    vi.setSystemTime(new Date(2026, 5, 1, 15, 0, 0));
    render(<DashboardHeader />);
    expect(screen.getByText(/Good afternoon,/)).toBeInTheDocument();
  });

  it("renders 24-hour time and dynamic date", () => {
    vi.setSystemTime(new Date(2026, 5, 1, 9, 45, 0));
    render(<DashboardHeader />);
    expect(screen.getByText("09")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText(/Monday, June 1/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/DashboardHeader.test.tsx`
Expected: FAIL (Module not found or compilation error).

- [ ] **Step 3: Implement DashboardHeader**

Create `src/components/DashboardHeader.tsx`:
```tsx
import { useEffect, useState } from "react";

export function DashboardHeader() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = time.getHours();
  const greeting = hours < 12 ? "Good morning" : hours < 18 ? "Good afternoon" : "Good evening";

  // Clock offsets for SVG
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const displayHours = time.getHours();

  // Dash offsets for R=135, 120, 105
  // Circumference = 2 * pi * r
  const secondsOffset = 2 * Math.PI * 135 * (1 - seconds / 60);
  const minutesOffset = 2 * Math.PI * 120 * (1 - minutes / 60);
  const hoursOffset = 2 * Math.PI * 105 * (1 - (displayHours % 12) / 12);

  const formattedHours = String(displayHours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const dateString = time.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="combined-header-card relative grid min-h-[130px] grid-cols-1 gap-6 overflow-hidden rounded-2xl border border-white/10 bg-card p-6 shadow-2xl md:grid-cols-3 md:px-8">
      {/* Giant concentric SVG behind middle column */}
      <svg className="giant-background-svg pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 -rotate-90 opacity-40 z-0">
        {/* Seconds Ring */}
        <circle cx="160" cy="160" r="135" className="fill-none stroke-white/5 stroke-[5]" strokeDasharray="0 12" strokeLinecap="round" />
        <circle cx="160" cy="160" r="135" className="fill-none stroke-accent-coral stroke-[5]" strokeDasharray="0 12" strokeLinecap="round" strokeDashoffset={secondsOffset} />

        {/* Minutes Ring */}
        <circle cx="160" cy="160" r="120" className="fill-none stroke-white/5 stroke-[5]" strokeDasharray="0 12" strokeLinecap="round" />
        <circle cx="160" cy="160" r="120" className="fill-none stroke-accent-amber stroke-[5]" strokeDasharray="0 12" strokeLinecap="round" strokeDashoffset={minutesOffset} />

        {/* Hours Ring */}
        <circle cx="160" cy="160" r="105" className="fill-none stroke-white/5 stroke-[5]" strokeDasharray="0 12" strokeLinecap="round" />
        <circle cx="160" cy="160" r="105" className="fill-none stroke-accent-violet stroke-[5]" strokeDasharray="0 12" strokeLinecap="round" strokeDashoffset={hoursOffset} />
      </svg>

      {/* Column 1: Greeting & Dotted Wave */}
      <div className="greeting-col z-10 flex flex-col items-start justify-center">
        <span className="text-[10px] uppercase tracking-widest text-text-muted">Welcome back</span>
        <div className="greeting-wrapper relative inline-block pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-text-bright">
            {greeting}, <span className="text-accent-amber font-extrabold">Dre</span>
          </h1>
          {/* Wave Divider */}
          <div className="wave-divider absolute bottom-0.5 left-0 right-0 flex h-2 justify-between">
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className="wave-dot h-[3.5px] w-[3.5px] rounded-full bg-accent-amber"
                style={{
                  animation: `wave-bounce 2s infinite ease-in-out`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Column 2: Clock Display */}
      <div className="clock-center-container z-10 flex flex-col items-center justify-center self-center text-center">
        <div className="date-display text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5">
          {dateString}
        </div>
        <div className="digital-time font-mono text-3xl font-extrabold text-text-bright">
          <span className="text-accent-amber">{formattedHours}</span>
          <span className="ticking-colon text-accent-amber animate-[blink-tick_1s_steps(1)_infinite]">:</span>
          <span>{formattedMinutes}</span>
        </div>
      </div>

      {/* Column 3: AI Briefing Slot */}
      <div className="ai-col z-10 flex w-full max-w-[320px] flex-col justify-self-end rounded-xl border border-white/5 bg-white/5 p-3.5 text-xs text-text-muted">
        <div className="ai-header mb-1.5 flex items-center justify-between font-bold uppercase tracking-widest text-accent-teal">
          <span>🤖 LUMIX Briefing</span>
          <button className="ai-chat-btn rounded-md border border-accent-amber/20 bg-accent-amber/15 px-2 py-0.5 text-[10px] text-accent-amber transition hover:bg-accent-amber/25">
            Open Chat
          </button>
        </div>
        <p className="leading-relaxed">
          Good morning, Dre! Dashboard data is ready. You have <strong className="text-accent-amber">3 tasks</strong> pending. Weather is Partly cloudy.
        </p>
      </div>
    </div>
  );
}
```

Add these custom keyframe definitions to `src/index.css` to enable the bounce and blink animations:
```css
@keyframes wave-bounce {
  0%, 100% { transform: translateY(0); opacity: 0.4; }
  50% { transform: translateY(-5px); opacity: 1; background-color: var(--bg-deep); }
}

@keyframes blink-tick {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0.15; }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/DashboardHeader.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/DashboardHeader.tsx src/components/DashboardHeader.test.tsx
git commit -m "feat: implement unified DashboardHeader component with concentric clock"
```

---

### Task 2: Update WidgetFrame implementation & tests

**Files:**
- Modify: `src/components/WidgetFrame.tsx`
- Modify: `src/components/WidgetFrame.test.tsx`

- [ ] **Step 1: Write the failing tests**

Update `src/components/WidgetFrame.test.tsx` to assert the uppercase bold style, dotted line presence, and non-accented child content area:
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

  it("renders uppercase bold title in accent color", () => {
    render(<WidgetFrame title="weather" accent="amber" state="ready">hello</WidgetFrame>);
    const titleElement = screen.getByText("weather");
    expect(titleElement).toHaveClass("text-accent-amber");
    expect(titleElement).toHaveClass("font-bold");
    expect(titleElement).toHaveClass("uppercase");
  });

  it("renders the dotted divider divider rule in header", () => {
    const { container } = render(<WidgetFrame title="Weather" accent="amber" state="ready">hello</WidgetFrame>);
    const divider = container.querySelector(".dotted-rule");
    expect(divider).toBeInTheDocument();
  });

  it("child container uses neutral styles and does not inherit accent directly", () => {
    const { container } = render(<WidgetFrame title="Weather" accent="amber" state="ready">hello</WidgetFrame>);
    const childContainer = container.querySelector(".widget-content-body");
    expect(childContainer).not.toHaveClass("text-accent-amber");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components/WidgetFrame.test.tsx`
Expected: FAIL (assertion errors on uppercase/dotted/neutral classes).

- [ ] **Step 3: Modify WidgetFrame**

Update `src/components/WidgetFrame.tsx`:
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
    <div className="flex h-full w-full flex-col gap-2 rounded-2xl border border-white/10 bg-card p-4 shadow-lg">
      <div className="flex flex-col gap-1.5 mb-2 pb-1 border-b-0">
        <div className="flex items-baseline justify-between">
          <span className={`text-xs md:text-sm font-bold uppercase tracking-wider ${accentClass[accent]}`}>
            {title}
          </span>
        </div>
        {/* Dotted Matrix divider */}
        <div
          className="dotted-rule h-[2px] w-full opacity-40"
          style={{
            background: `radial-gradient(circle, currentColor 0%, transparent 100%)`,
            backgroundSize: `6px 2px`,
            color: `var(--accent-${accent})`,
          }}
        />
      </div>
      <div className="widget-content-body flex-1 overflow-auto text-text-bright">
        {state === "loading" && <Skeleton />}
        {state === "error" && <p className="text-sm text-accent-coral">{error ?? "Something went wrong"}</p>}
        {state === "empty" && <p className="text-sm text-text-muted">Nothing here yet.</p>}
        {state === "ready" && children}
      </div>
    </div>
  );
}
```

Add the CSS color variables in `src/index.css` for background gradient color referencing:
```css
:root {
  --accent-amber: #ffc879;
  --accent-teal: #5fe0c8;
  --accent-coral: #ff8f7a;
  --accent-violet: #c2a6ff;
  --accent-green: #a6e081;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/components/WidgetFrame.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/WidgetFrame.tsx src/components/WidgetFrame.test.tsx
git commit -m "feat: redesign WidgetFrame with bold uppercase headers, dotted dividers and neutral children text colors"
```

---

### Task 3: Remove ClockWidget from registry & update App/DashboardGrid

**Files:**
- Modify: `src/widgets/registry.ts`
- Modify: `src/widgets/registry.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Write the failing tests**

Update `src/widgets/registry.test.ts` to assert the registry does NOT contain the clock widget:
```ts
import { describe, it, expect } from "vitest";
import { registry } from "./registry";

describe("registry", () => {
  it("has unique ids and does not contain clock", () => {
    const ids = registry.map((w) => w.id);
    expect(ids).not.toContain("clock");
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

Update `src/App.test.tsx` to assert `DashboardHeader` is mounted:
```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({})
    }));
  });

  it("renders the redesigned DashboardHeader and greeting", () => {
    render(<App />);
    expect(screen.getByText(/Dre/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/widgets/registry.test.ts src/App.test.tsx`
Expected: FAIL (assertion fails or clock still exists in registry).

- [ ] **Step 3: Modify registry, App.tsx & clean up**

Update `src/widgets/registry.ts` to remove clock:
```ts
import type { WidgetDefinition } from "./types";
import { WeatherView, useWeatherData } from "./Weather/WeatherWidget";
import { TodosView, useTodosData } from "./Todos/TodosWidget";
import { GitHubView, useGitHubData } from "./GitHub/GitHubWidget";
import { CalendarView, useCalendarData } from "./Calendar/CalendarWidget";
import { MailView, useMailData } from "./Mail/MailWidget";
import { GcpView, useGcpData } from "./GCP/GcpWidget";

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
  {
    id: "todos",
    name: "Todos",
    accent: "teal",
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    Component: TodosView as WidgetDefinition["Component"],
    useData: useTodosData as WidgetDefinition["useData"],
  },
  {
    id: "github",
    name: "GitHub",
    accent: "coral",
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    Component: GitHubView as WidgetDefinition["Component"],
    useData: useGitHubData as WidgetDefinition["useData"],
  },
  {
    id: "calendar",
    name: "Calendar",
    accent: "violet",
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    Component: CalendarView as WidgetDefinition["Component"],
    useData: useCalendarData as WidgetDefinition["useData"],
  },
  {
    id: "mail",
    name: "Mail",
    accent: "teal",
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    Component: MailView as WidgetDefinition["Component"],
    useData: useMailData as WidgetDefinition["useData"],
  },
  {
    id: "gcp",
    name: "GCP",
    accent: "green",
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    Component: GcpView as WidgetDefinition["Component"],
    useData: useGcpData as WidgetDefinition["useData"],
  },
];
```

Update `src/App.tsx` to include `DashboardHeader`:
```tsx
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardGrid } from "./components/DashboardGrid";

export default function App() {
  return (
    <main className="mx-auto max-w-[1120px] p-6 flex flex-col gap-6">
      <DashboardHeader />
      <DashboardGrid />
    </main>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS (all tests pass, warnings handled).

- [ ] **Step 5: Commit**

```bash
git add src/widgets/registry.ts src/widgets/registry.test.ts src/App.tsx src/App.test.tsx
git commit -m "chore: remove ClockWidget from registry and mount unified DashboardHeader"
```

---

### Task 4: Final verification and build checks

- [ ] **Step 1: Check production build succeeds**

Run: `npm run build`
Expected: PASS with no compilation, lint, or Project Reference errors.

- [ ] **Step 2: Commit any final cleanup**

```bash
git add -A && git commit -m "chore: final layout cleanups and build validation" --allow-empty
```
