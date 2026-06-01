import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { useContext, useEffect } from "react";
import { DashboardDataProvider, DashboardDataContext, type WidgetDataState } from "./DashboardDataContext";

function TestConsumer() {
  const ctx = useContext(DashboardDataContext);
  if (!ctx) return null;
  return (
    <div>
      <div data-testid="data-length">{Object.keys(ctx.widgetsData).length}</div>
      <button
        onClick={() => ctx.updateWidgetData("test-id", "Test Widget", "ready", { foo: "bar" })}
      >
        Update
      </button>
      <div data-testid="widget-val">{(ctx.widgetsData["test-id"]?.data as { foo?: string })?.foo}</div>
    </div>
  );
}

describe("DashboardDataContext", () => {
  it("manages and updates widget state correctly", () => {
    render(
      <DashboardDataProvider>
        <TestConsumer />
      </DashboardDataProvider>
    );
    expect(screen.getByTestId("data-length")).toHaveTextContent("0");
    fireEvent.click(screen.getByText("Update"));
    expect(screen.getByTestId("data-length")).toHaveTextContent("1");
    expect(screen.getByTestId("widget-val")).toHaveTextContent("bar");
  });

  it("keeps the stored entry reference stable when updated with equal content", () => {
    const holder: { ctx: { widgetsData: Record<string, WidgetDataState>; updateWidgetData: (...a: never[]) => void } | null } = { ctx: null };
    function Capture() {
      const value = useContext(DashboardDataContext);
      useEffect(() => {
        holder.ctx = value as never;
      });
      return null;
    }
    render(
      <DashboardDataProvider>
        <Capture />
      </DashboardDataProvider>
    );
    // A widget hook that returns a fresh data object each render must not churn
    // context state, or it loops forever.
    act(() => holder.ctx!.updateWidgetData("w" as never, "W" as never, "ready" as never, { a: 1 } as never));
    const first = holder.ctx!.widgetsData["w"];
    act(() => holder.ctx!.updateWidgetData("w" as never, "W" as never, "ready" as never, { a: 1 } as never));
    expect(holder.ctx!.widgetsData["w"]).toBe(first);
  });
});
