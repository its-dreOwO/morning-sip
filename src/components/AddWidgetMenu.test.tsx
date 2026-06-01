import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddWidgetMenu } from "./AddWidgetMenu";

describe("AddWidgetMenu", () => {
  it("lists hidden widgets and calls onAdd with the chosen id", async () => {
    const onAdd = vi.fn();
    render(<AddWidgetMenu hiddenIds={["mail"]} onAdd={onAdd} />);
    await userEvent.click(screen.getByRole("button", { name: /add widget/i }));
    await userEvent.click(screen.getByText("Mail"));
    expect(onAdd).toHaveBeenCalledWith("mail");
  });

  it("shows an all-shown message when nothing is hidden", async () => {
    render(<AddWidgetMenu hiddenIds={[]} onAdd={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: /add widget/i }));
    expect(screen.getByText(/all widgets shown/i)).toBeInTheDocument();
  });
});
