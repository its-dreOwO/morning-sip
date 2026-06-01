import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GitHubView, type GitHubData } from "./GitHubWidget";

const sample: GitHubData = {
  weekTotal: 71,
  perDay: [
    { day: "Mon", commits: 4 },
    { day: "Tue", commits: 2 },
  ],
  weeks: [[{ date: "2025-06-01", count: 4, level: 4 }]],
  yearTotal: 185,
};

describe("GitHubView", () => {
  it("renders the weekly contribution total", () => {
    render(<GitHubView state="ready" expanded={false} data={sample} />);
    expect(screen.getByText("71")).toBeInTheDocument();
    expect(screen.getByText(/contributions this week/i)).toBeInTheDocument();
  });

  it("renders the contribution heatmap inline on the card", () => {
    render(<GitHubView state="ready" expanded={false} data={sample} />);
    expect(screen.getByText("185")).toBeInTheDocument();
    expect(screen.getByText(/contributions in the last year/i)).toBeInTheDocument();
  });
});
