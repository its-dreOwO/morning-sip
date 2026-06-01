# Design Spec: Greeting Header Redesign

**Date:** 2026-06-01  
**Status:** Approved  

---

## 1. Purpose
Redesign the main dashboard page header into a unified, ultra-premium 3-column glassmorphic card. This combines the time-based greeting, date, an integrated concentric dot-matrix clock, and the upcoming LUMIX AI Briefing slot into a single cohesive layout. Consequently, the separate Clock widget inside the dashboard grid registry will be removed to save grid space.

---

## 2. Layout & Styling Details
The header lives inside a new component or wraps the top of `src/App.tsx`.

### 2.1. Header Container (`combined-header-card`)
- **Visuals**: Glassmorphic capsule styled with Tailwind `bg-card border border-white/10 backdrop-blur-md shadow-2xl`.
- **Dimensions**: Centered container, `min-h-[130px] rounded-2xl p-6 md:px-8`.
- **Layout**: CSS Grid with 3 columns:
  - Column 1 (Left): `flex flex-col items-start justify-center` (Greeting & Wave)
  - Column 2 (Middle): `flex flex-col items-center justify-center relative` (Clock & Date)
  - Column 3 (Right): `flex flex-col justify-self-end w-full max-w-[320px]` (LUMIX AI Briefing slot)
- **Clipping**: `overflow: hidden` to clip the giant background concentric clock rings.

### 2.2. Left Column: Greeting & Fitted Dotted Wave
- **Greeting**: "Welcome back" (uppercase tracking text-muted text-[10px]) followed by a dynamic time-of-day greeting: "Good morning, Good afternoon, or Good evening" based on system time.
- **Highlighting**: The user name `"Dre"` is styled with `text-accent-amber font-extrabold` inside the heading.
- **Dotted Wave Divider**:
  - Positioned directly below the greeting heading inside a `w-fit` wrapper to match its exact width.
  - Composed of a series of 15-20 circular dots animated using CSS keyframes (`wave-bounce`) that undulate vertically in a staggered timing sequence, shifting colors smoothly between amber and violet.

### 2.3. Middle Column: Date & Giant Dotted Clock
- **Date Display**: "Monday, June 1, 2026" (uppercase tracking text-muted text-xs font-semibold) positioned directly above the clock pill.
- **Clock Pill**: A background-glowing container housing:
  - **Giant Concentric SVG Clock Face**: Absolute-positioned behind the column (`z-index: 1`, `pointer-events: none`, `w-[320px] h-[320px]`). Features 3 closely grouped concentric rings (spacing = 15px, radii at 105, 120, and 135) rendered with round dotted paths (`stroke-dasharray="0 12"`, `stroke-linecap="round"`).
  - **Clock Animations**: 
    - The outer Seconds ring (coral) rotates in a smooth, continuous linear sweep over 60 seconds (`animation: smooth-rotation 60s linear infinite`).
    - The Minutes (amber) and Hours (violet) rings rotate smoothly in 1-hour and 12-hour cycles respectively.
  - **Digital Clock**: Large monospace numbers (`text-3xl font-extrabold`). The Hour digits ("09") and the colon `:` are highlighted in amber. The colon ticks sharply (toggles opacity between 1.0 and 0.15) at a step-wise 1Hz rhythm.

### 2.4. Right Column: LUMIX AI Briefing Slot
- **Visuals**: A clean, nested glass card (`bg-white/5 border border-white/5 rounded-xl p-3`).
- **Content**: Placed as a slot that shows the LUMIX summary.
  - Header: "🤖 LUMIX Briefing" on the left, "Open Chat" (triggering the sidebar drawer) on the right.
  - Body: 2-3 sentences of context-aware summary text summarizing dashboard widget states.

---

## 3. Architecture & Component Map
```
src/
  components/
    DashboardHeader.tsx        New unified header component containing 3-column layout
  App.tsx                      Renders DashboardHeader and DashboardGrid
  widgets/
    registry.ts                Remove "clock" widget from array
```

---

## 4. Test & Verification Plan
1. **Dynamic Greeting Test**: Verify `DashboardHeader` greeting message updates correctly depending on the simulated hour.
2. **Digital Clock Test**: Verify hours are formatted in 24-hour style, hours are highlighted in amber, and the colon blinks.
3. **SVG Clock Render**: Verify circles are rendered with `stroke-dasharray` and expected radii.
4. **Registry Cleanup**: Verify Clock widget is deleted from `registry.ts` and doesn't mount in the grid.
5. **Typecheck Gate**: Run `npm run build` to ensure project builds cleanly.
