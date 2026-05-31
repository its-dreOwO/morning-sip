import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

// Weather widget fetches on mount; stub fetch so the tree mounts cleanly.
beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
});

describe("App", () => {
  it("mounts the dashboard shell without throwing and shows the greeting", () => {
    render(<App />);
    expect(screen.getByText(/, Dre/)).toBeInTheDocument();
  });

  it("renders the registered widget frames", () => {
    render(<App />);
    // WidgetFrame renders the widget name as an uppercase label.
    expect(screen.getByText("Weather")).toBeInTheDocument();
  });
});
