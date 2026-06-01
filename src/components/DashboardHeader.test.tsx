import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardHeader } from "./DashboardHeader";

describe("DashboardHeader", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a morning greeting before noon", () => {
    vi.setSystemTime(new Date(2026, 5, 1, 9, 0, 0));
    render(<DashboardHeader />);
    const heading = screen.getByRole("heading");
    expect(heading).toHaveTextContent("Good morning, Dre");
    expect(screen.getByText("Dre")).toHaveClass("text-accent-amber");
  });

  it("renders an afternoon greeting between noon and 6pm", () => {
    vi.setSystemTime(new Date(2026, 5, 1, 15, 0, 0));
    render(<DashboardHeader />);
    expect(screen.getByRole("heading")).toHaveTextContent("Good afternoon, Dre");
  });

  it("renders a night greeting from 6pm onward", () => {
    vi.setSystemTime(new Date(2026, 5, 1, 21, 0, 0));
    render(<DashboardHeader />);
    expect(screen.getByRole("heading")).toHaveTextContent("Good night, Dre");
  });

  it("renders 24-hour time digits and the dynamic date", () => {
    vi.setSystemTime(new Date(2026, 5, 1, 9, 45, 0));
    render(<DashboardHeader />);
    expect(screen.getByText("09")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByText(/Monday, June 1/i)).toBeInTheDocument();
  });
});
