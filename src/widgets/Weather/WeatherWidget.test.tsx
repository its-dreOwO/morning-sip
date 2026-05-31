import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WeatherView } from "./WeatherWidget";

describe("WeatherView", () => {
  it("renders temperature and condition when ready", () => {
    render(
      <WeatherView
        state="ready"
        expanded={false}
        data={{ tempC: 18, condition: "Partly cloudy", high: 21, low: 11, nextHours: [17, 18, 19] }}
      />
    );
    expect(screen.getByText("18°")).toBeInTheDocument();
    expect(screen.getByText(/Partly cloudy/)).toBeInTheDocument();
  });
});
