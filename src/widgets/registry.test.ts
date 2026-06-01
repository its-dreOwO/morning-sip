import { describe, it, expect } from "vitest";
import { registry } from "./registry";

describe("registry", () => {
  it("has unique ids and no longer registers the clock widget", () => {
    const ids = registry.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain("clock");
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
