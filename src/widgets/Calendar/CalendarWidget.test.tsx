import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalendarView } from "./CalendarWidget";

describe("CalendarView", () => {
  it("renders the next event time and title", () => {
    render(
      <CalendarView
        state="ready"
        expanded={false}
        data={{ events: [{ id: "1", time: "9:30", title: "Standup" }] }}
      />
    );
    expect(screen.getByText("9:30")).toBeInTheDocument();
    expect(screen.getByText("Standup")).toBeInTheDocument();
  });
});
