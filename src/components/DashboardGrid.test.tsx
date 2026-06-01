import { describe, it, expect, beforeEach } from "vitest";
import type { LayoutItem } from "react-grid-layout";
import { defaultLayout, reconcileLayout } from "./DashboardGrid";
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

describe("reconcileLayout", () => {
  it("appends a default entry for registry widgets missing from the stored layout", () => {
    const partial: LayoutItem[] = []; // stored layout has no widgets yet
    const result = reconcileLayout(partial);
    const ids = result.map((l) => l.i).sort();
    expect(ids).toEqual(registry.map((w) => w.id).sort());
  });

  it("keeps existing entries (and their positions) untouched", () => {
    const existing: LayoutItem = { i: "weather", x: 3, y: 5, w: 2, h: 2 };
    const result = reconcileLayout([existing]);
    const weather = result.find((l) => l.i === "weather")!;
    expect(weather.x).toBe(3);
    expect(weather.y).toBe(5);
  });

  it("drops entries whose widget no longer exists in the registry", () => {
    const orphan: LayoutItem = { i: "ghost-widget", x: 0, y: 0, w: 2, h: 2 };
    const result = reconcileLayout([orphan]);
    expect(result.some((l) => l.i === "ghost-widget")).toBe(false);
  });

  it("does not re-add a dismissed widget that is missing from the stored layout", () => {
    const result = reconcileLayout([], ["mail"]);
    expect(result.some((l) => l.i === "mail")).toBe(false);
    // other registry widgets are still added
    expect(result.some((l) => l.i === "weather")).toBe(true);
  });
});
