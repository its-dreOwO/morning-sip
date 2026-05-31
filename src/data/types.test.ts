import { describe, it, expect } from "vitest";
import { isReady } from "./types";

describe("isReady", () => {
  it("returns true only when state is ready and data is present", () => {
    expect(isReady({ state: "ready", data: { x: 1 } })).toBe(true);
    expect(isReady({ state: "loading", data: null })).toBe(false);
    expect(isReady({ state: "ready", data: null })).toBe(false);
  });
});
