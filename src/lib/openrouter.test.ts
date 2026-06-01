import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchLUMIXBriefing, askLUMIX } from "./openrouter";

describe("openrouter client", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a briefing request with the bearer key and returns the message content", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "Good morning! It's clear outside." } }] }),
    } as unknown as Response);

    const result = await fetchLUMIXBriefing("key-123", {
      weather: { id: "weather", name: "Weather", state: "ready", data: { temp: 18 } },
    });

    expect(result).toBe("Good morning! It's clear outside.");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://openrouter.ai/api/v1/chat/completions",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer key-123" }),
      })
    );
  });

  it("includes the chat history when asking LUMIX", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ choices: [{ message: { content: "You have 3 unread." } }] }),
    } as unknown as Response);

    const result = await askLUMIX("key-9", {}, [{ role: "user", content: "How much mail?" }]);

    expect(result).toBe("You have 3 unread.");
    const body = JSON.parse(mockFetch.mock.calls[0][1]!.body as string);
    expect(body.messages.at(-1)).toEqual({ role: "user", content: "How much mail?" });
    expect(body.model).toBe("deepseek/deepseek-v4-flash");
  });

  it("throws a descriptive error on a non-ok response", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      json: async () => ({}),
    } as unknown as Response);

    await expect(fetchLUMIXBriefing("bad", {})).rejects.toThrow(/401/);
  });
});
