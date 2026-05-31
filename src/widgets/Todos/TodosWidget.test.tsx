import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TodosView } from "./TodosWidget";

describe("TodosView", () => {
  it("renders todo items and a remaining count", () => {
    render(
      <TodosView
        state="ready"
        expanded={false}
        data={{
          items: [
            { id: "1", text: "Ship PR", done: false },
            { id: "2", text: "Coffee", done: true },
          ],
          onToggle: () => {},
        }}
      />
    );
    expect(screen.getByText("Ship PR")).toBeInTheDocument();
    expect(screen.getByText(/1 left/)).toBeInTheDocument();
  });
});
