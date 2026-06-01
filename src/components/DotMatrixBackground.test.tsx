import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { DotMatrixBackground } from "./DotMatrixBackground";

describe("DotMatrixBackground", () => {
  it("renders a canvas element", () => {
    const { container } = render(<DotMatrixBackground opacity={0.6} spacing={14} />);
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });
});
