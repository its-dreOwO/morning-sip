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
