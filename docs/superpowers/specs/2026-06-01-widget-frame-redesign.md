# Design Spec: Widget Frame Redesign

**Date:** 2026-06-01  
**Status:** Approved  

---

## 1. Purpose
Redesign the standard container frame (`WidgetFrame.tsx`) surrounding all dashboard widgets. This upgrades them to use a clean, modern aesthetic featuring:
1. Bold, uppercase titles highlighted in the widget's active accent color.
2. A dotted matrix horizontal divider rule under the title, coordinating with the dashboard dot-matrix theme.
3. High-contrast neutral color styling for child elements to replace the current layout which tints all child text in the accent color.

---

## 2. Layout & Styling Details

### 2.1. Container Frame (`WidgetFrame`)
- **Visuals**: Glassmorphic capsule styled with Tailwind `rounded-2xl border border-white/10 bg-card p-4 shadow-lg`.
- **Inner Structure**:
  - **Header Area**: Flex container (`flex flex-col gap-1.5 mb-2 pb-1`).
    - **Header Row**: Flex row (`flex items-baseline justify-between`).
      - Title: Bold, uppercase (`font-bold uppercase tracking-wider text-xs md:text-sm`) colored in the active accent class (e.g. `text-accent-amber`).
      - Action/Label: Action buttons or sub-labels in small muted text.
    - **Dotted Matrix Divider**: A horizontal dotted divider directly below the header row:
      - Styled as: `h-[2px] w-full opacity-40`.
      - Visual: `background: radial-gradient(circle, currentColor 0%, transparent 100%)` with a `background-size: 6px 2px` to draw clean round dots.
  - **Content Area**: 
    - Smooth scrollable container: `flex-1 overflow-auto`.
    - **Contrast Update**: Replaces the old class (`flex-1 overflow-auto ${accentClass[accent]}`) which forced all child text to inherit the accent color.
    - The new content area has neutral text (`text-text-bright`, `text-text-muted`). Accent colors are reserved for specific graph elements, highlighted numbers, or badges, making the dashboard much more legible.

---

## 3. Architecture & Component Map
```
src/
  components/
    WidgetFrame.tsx             Upgraded container frame with dotted divider and neutral text
```

---

## 4. Test & Verification Plan
1. **Title Rendering**: Verify the widget title is rendered uppercase and uses the correct `text-accent-[color]` class.
2. **Dotted Rule Rendering**: Verify the dotted rule is present in the header hierarchy.
3. **Contrast Verification**: Verify that child container elements do not inherit the accent color directly, allowing neutral colors.
4. **Unit Tests**: Update existing `WidgetFrame.test.tsx` assertions to match the new structure.
5. **Typecheck Gate**: Run `npm run build` to ensure the project builds correctly.
