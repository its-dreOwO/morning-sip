import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CopilotSidebar } from "./CopilotSidebar";
import { DashboardDataProvider } from "../context/DashboardDataContext";

function renderSidebar(props: Partial<React.ComponentProps<typeof CopilotSidebar>> = {}) {
  return render(
    <DashboardDataProvider>
      <CopilotSidebar open onClose={() => {}} apiKey="key-1" {...props} />
    </DashboardDataProvider>
  );
}

describe("CopilotSidebar", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("is not rendered when closed", () => {
    renderSidebar({ open: false });
    expect(screen.queryByPlaceholderText(/ask lumix/i)).not.toBeInTheDocument();
  });

  it("sends a message and shows the assistant reply", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "You have 3 unread emails." } }] }),
    } as unknown as Response);

    renderSidebar();
    fireEvent.change(screen.getByPlaceholderText(/ask lumix/i), { target: { value: "How much mail?" } });
    fireEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(screen.getByText("How much mail?")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("You have 3 unread emails.")).toBeInTheDocument());
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    renderSidebar({ onClose });
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("prompts for a key when none is set", () => {
    renderSidebar({ apiKey: "" });
    expect(screen.getByText(/api key/i)).toBeInTheDocument();
  });
});
