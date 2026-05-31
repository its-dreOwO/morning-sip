import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ClockView } from "./ClockWidget";

describe("ClockView", () => {
  it("renders the provided time string", () => {
    render(<ClockView state="ready" expanded={false} data={{ time: "7:42", date: "Saturday" }} />);
    expect(screen.getByText("7:42")).toBeInTheDocument();
    expect(screen.getByText("Saturday")).toBeInTheDocument();
  });
});
