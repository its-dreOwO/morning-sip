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

  it("renders children when ready", () => {
    render(<WidgetFrame title="Weather" accent="amber" state="ready">hello</WidgetFrame>);
    expect(screen.getByText("hello")).toBeInTheDocument();
  });
});
