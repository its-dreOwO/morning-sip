import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ApiKeyPopover } from "./ApiKeyPopover";

describe("ApiKeyPopover", () => {
  it("opens the popover and saves a typed key", () => {
    const onSave = vi.fn();
    render(<ApiKeyPopover apiKey="" onSave={onSave} onClear={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /lumix settings/i }));
    fireEvent.change(screen.getByPlaceholderText(/openrouter api key/i), { target: { value: "sk-abc" } });
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    expect(onSave).toHaveBeenCalledWith("sk-abc");
  });

  it("does not save an empty key", () => {
    const onSave = vi.fn();
    render(<ApiKeyPopover apiKey="" onSave={onSave} onClear={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /lumix settings/i }));
    fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it("offers to clear an existing key", () => {
    const onClear = vi.fn();
    render(<ApiKeyPopover apiKey="sk-existing" onSave={() => {}} onClear={onClear} />);
    fireEvent.click(screen.getByRole("button", { name: /lumix settings/i }));
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(onClear).toHaveBeenCalled();
  });
});
