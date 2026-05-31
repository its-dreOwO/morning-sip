import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GitHubView } from "./GitHubWidget";

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
});
