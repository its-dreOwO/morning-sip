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

  it("renders a rain animation for rainy conditions", () => {
    render(
      <WeatherView
        state="ready"
        expanded={false}
        data={{ tempC: 14, condition: "Rainy", high: 16, low: 10, nextHours: [14, 13, 12] }}
      />
    );
    expect(screen.getByTestId("weather-anim-rain")).toBeInTheDocument();
  });

  it("renders a sun animation for clear conditions", () => {
    render(
      <WeatherView
        state="ready"
        expanded={false}
        data={{ tempC: 26, condition: "Clear sky", high: 28, low: 18, nextHours: [26, 27, 25] }}
      />
    );
    expect(screen.getByTestId("weather-anim-sun")).toBeInTheDocument();
  });
});
