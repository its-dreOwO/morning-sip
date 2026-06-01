import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnimatedNumber } from "./AnimatedNumber";

describe("AnimatedNumber", () => {
  it("renders the target value synchronously with an optional prefix", () => {
    render(<AnimatedNumber value={37} prefix="$" />);
    expect(screen.getByText("$37")).toBeInTheDocument();
  });

  it("renders a plain integer when no prefix/suffix given", () => {
    render(<AnimatedNumber value={12} />);
    expect(screen.getByText("12")).toBeInTheDocument();
  });
});
