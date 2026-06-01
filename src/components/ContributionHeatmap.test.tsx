import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContributionHeatmap } from "./ContributionHeatmap";
import type { ContributionDay } from "../data/sources/contributionsSource";

const week = (lvls: number[]): ContributionDay[] =>
  lvls.map((level, i) => ({ date: `2025-06-0${i + 1}`, count: level, level: level as ContributionDay["level"] }));

describe("ContributionHeatmap", () => {
  const weeks = [week([0, 1, 2]), week([3, 4, 0])];

  it("shows the total contribution count", () => {
    render(<ContributionHeatmap weeks={weeks} total={42} />);
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it("renders one cell per contribution day", () => {
    const { container } = render(<ContributionHeatmap weeks={weeks} total={42} />);
    expect(container.querySelectorAll("[data-contrib-cell]")).toHaveLength(6);
  });

  it("tags each cell with its level for color mapping", () => {
    const { container } = render(<ContributionHeatmap weeks={[week([4])]} total={9} />);
    const cell = container.querySelector("[data-contrib-cell]");
    expect(cell).toHaveAttribute("data-level", "4");
  });

  it("renders a less/more legend", () => {
    render(<ContributionHeatmap weeks={weeks} total={42} />);
    expect(screen.getByText(/less/i)).toBeInTheDocument();
    expect(screen.getByText(/more/i)).toBeInTheDocument();
  });
});
