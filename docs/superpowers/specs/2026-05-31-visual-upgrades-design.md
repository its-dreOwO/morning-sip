# Dashboard Visual Upgrades Spec

**Date:** 2026-05-31
**Status:** Approved

## 1. Purpose
Incorporate premium visual and interactive design elements into the morning dashboard. This includes:
1. A **full-screen Canvas-based Dot Matrix Wave Background Wall** with customizable density/brightness controls.
2. An **updated Widget Frame layout** featuring larger, accent-colored bold titles and horizontal dividers.
3. **Animated CSS-based SVG weather condition graphics** inside the Weather widget.
4. An **Analog-Dominant Concentric Ring Clock** inside the Clock widget, placing the analog visual on the left and 24-hour digital time (with blinking separator) on the right.

---

## 2. Scope & Design Features

### 2.1. Dot Matrix Background Wall (`DotMatrixBackground.tsx`)
- A full-screen canvas rendered as a fixed background layer behind the grid.
- **Physics/Math:** sum-of-sines 2D interference pattern for organic multi-directional waves.
- **Default Parameters:** Peak opacity of `0.6` and spacing of `14px`.
- **Accent Integration:** Inherits colors from active theme tokens (defaults to amber `#ffc879`).
- **Interactive Controls:** Spacing/opacity sliders added in a settings popover in the dashboard.

### 2.2. Widget Frame Enhancement (`WidgetFrame.tsx`)
- Title size increased to `text-base` (`16px`), styled as `font-semibold`.
- Title color highlighted in its active accent class (e.g. `text-accent-amber`).
- Horizontal bottom border separator (`border-b border-white/5 pb-2 mb-2`) dividing header from children.

### 2.3. Animated Weather Graphics (`WeatherWidget.tsx`)
- Lightweight, inline SVGs with pure CSS animations to avoid heavy packages:
  - **Sunny:** Rotating sun rays with spin animation.
  - **Cloudy:** Floating cloud with subtle vertical drift.
  - **Rainy:** Cloud with dripping rain droplets (linear translation + fade).
  - **Stormy:** Cloud with pulsing/flickering lightning bolt.

### 2.4. Clock Widget Layout (`ClockWidget.tsx`)
- **Main view:** Centered in the 2x1 frame, containing:
  - **Left (50%):** Large Concentric Ring Clock (Concentric Solid Rings style) representing Hours (inner, violet), Minutes (middle, amber), and Seconds (outer, coral) with dots that fill clockwise.
  - **Right (50%):** Vertical flex column showing the 24-hour digital time (e.g., `22:35`) and date details. The colon (`:`) pulses opacity every second.

---

## 3. Component Directory Map
```
src/
  components/
    DotMatrixBackground.tsx     Canvas background component
    WidgetFrame.tsx             Enhanced card container with larger colored header
  widgets/
    Clock/ClockWidget.tsx       Concentric clock face (left) + 24hr digital details (right)
    Weather/WeatherWidget.tsx   Weather details + custom animated SVG condition icon
```

---

## 4. Test Plan
- Verify canvas sizing and resizing bounds.
- Verify `WidgetFrame` contains the corrected heading class.
- Verify `ClockWidget` formats time in 24-hour layout and mounts the canvas face.
- Verify `WeatherWidget` loads correct SVG according to condition states.
