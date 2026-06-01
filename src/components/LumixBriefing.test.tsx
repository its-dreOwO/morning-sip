import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { LumixBriefing } from "./LumixBriefing";
import { DashboardDataProvider } from "../context/DashboardDataContext";

function renderBriefing(apiKey = "key-1") {
  return render(
    <DashboardDataProvider>
      <LumixBriefing apiKey={apiKey} />
    </DashboardDataProvider>
  );
}

describe("LumixBriefing", () => {
  beforeEach(() => vi.stubGlobal("fetch", vi.fn()));
  afterEach(() => vi.unstubAllGlobals());

  it("fetches and renders the briefing text", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Clear skies, 2 meetings, inbox calm." } }] }),
    } as unknown as Response);

    renderBriefing();
    await waitFor(() => expect(screen.getByText("Clear skies, 2 meetings, inbox calm.")).toBeInTheDocument());
  });

  it("shows an error when the briefing request fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
      json: async () => ({}),
    } as unknown as Response);

    renderBriefing();
    await waitFor(() => expect(screen.getByText(/429/)).toBeInTheDocument());
  });
});
