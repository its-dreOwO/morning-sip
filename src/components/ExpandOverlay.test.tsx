import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExpandOverlay } from "./ExpandOverlay";

describe("ExpandOverlay", () => {
  it("renders the title and children", () => {
    render(<ExpandOverlay title="Weather" onClose={() => {}}>detail</ExpandOverlay>);
    expect(screen.getByText("Weather")).toBeInTheDocument();
    expect(screen.getByText("detail")).toBeInTheDocument();
  });

  it("calls onClose when the backdrop is clicked", async () => {
    const onClose = vi.fn();
    render(<ExpandOverlay title="Weather" onClose={onClose}>detail</ExpandOverlay>);
    await userEvent.click(screen.getByTestId("overlay-backdrop"));
    expect(onClose).toHaveBeenCalled();
  });

  it("does not close when the panel content is clicked", async () => {
    const onClose = vi.fn();
    render(<ExpandOverlay title="Weather" onClose={onClose}>detail</ExpandOverlay>);
    await userEvent.click(screen.getByText("detail"));
    expect(onClose).not.toHaveBeenCalled();
  });
});
