import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GcpView } from "./GcpWidget";

describe("GcpView", () => {
  it("renders spend and budget percentage", () => {
    render(
      <GcpView
        state="ready"
        expanded={false}
        data={{ spend: 612, budget: 1000, breakdown: [{ name: "Compute", value: 400 }] }}
      />
    );
    expect(screen.getByText("$612")).toBeInTheDocument();
    expect(screen.getByText(/61%/)).toBeInTheDocument();
  });
});
