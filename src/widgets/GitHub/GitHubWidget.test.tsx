import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { GitHubView } from "./GitHubWidget";

vi.mock("../../data/sources/contributionsSource", () => ({
  fetchContributions: vi.fn().mockResolvedValue({
    totalContributions: 128,
    weeks: [[{ date: "2025-06-01", count: 4, level: 4 }]],
  }),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("GitHubView", () => {
  it("renders the total commit count", () => {
    render(
      <GitHubView
        state="ready"
        expanded={false}
        data={{ totalCommits: 37, perDay: [{ day: "Mon", commits: 5 }] }}
      />
    );
    expect(screen.getByText("37")).toBeInTheDocument();
  });

  it("does not fetch the contribution calendar when collapsed", async () => {
    const { fetchContributions } = await import("../../data/sources/contributionsSource");
    render(
      <GitHubView
        state="ready"
        expanded={false}
        data={{ totalCommits: 37, perDay: [{ day: "Mon", commits: 5 }] }}
      />
    );
    expect(fetchContributions).not.toHaveBeenCalled();
  });

  it("shows the contribution heatmap when expanded", async () => {
    render(
      <GitHubView
        state="ready"
        expanded={true}
        data={{ totalCommits: 37, perDay: [{ day: "Mon", commits: 5 }] }}
      />
    );
    expect(await screen.findByText("128")).toBeInTheDocument();
    expect(screen.getByText(/contributions in the last year/i)).toBeInTheDocument();
  });
});
