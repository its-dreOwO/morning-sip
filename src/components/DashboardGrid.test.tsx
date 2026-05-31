import { describe, it, expect, beforeEach } from "vitest";
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
