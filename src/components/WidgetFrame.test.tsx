import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("renders an uppercase bold title in the accent color", () => {
    render(<WidgetFrame title="weather" accent="amber" state="ready">hello</WidgetFrame>);
    const title = screen.getByText("weather");
    expect(title).toHaveClass("text-accent-amber");
    expect(title).toHaveClass("font-bold");
    expect(title).toHaveClass("uppercase");
  });

  it("renders a dotted divider rule under the header", () => {
    const { container } = render(<WidgetFrame title="Weather" accent="amber" state="ready">hello</WidgetFrame>);
    expect(container.querySelector(".dotted-rule")).toBeInTheDocument();
  });

  it("keeps the content body neutral instead of inheriting the accent color", () => {
    const { container } = render(<WidgetFrame title="Weather" accent="amber" state="ready">hello</WidgetFrame>);
    const body = container.querySelector(".widget-content-body");
    expect(body).toBeInTheDocument();
    expect(body).not.toHaveClass("text-accent-amber");
  });

  it("renders an expand button that calls onExpand when provided", async () => {
    const onExpand = vi.fn();
    render(<WidgetFrame title="Weather" accent="amber" state="ready" onExpand={onExpand}>hello</WidgetFrame>);
    await userEvent.click(screen.getByRole("button", { name: /expand/i }));
    expect(onExpand).toHaveBeenCalled();
  });

  it("omits the expand button when onExpand is not provided", () => {
    render(<WidgetFrame title="Weather" accent="amber" state="ready">hello</WidgetFrame>);
    expect(screen.queryByRole("button", { name: /expand/i })).not.toBeInTheDocument();
  });
});
