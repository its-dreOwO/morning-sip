import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchGitHubActivity } from "./githubSource";

beforeEach(() => { vi.restoreAllMocks(); localStorage.clear(); });

describe("fetchGitHubActivity", () => {
  it("counts push events per day for the last 7 days", async () => {
    const events = [
      { type: "PushEvent", created_at: new Date().toISOString(), payload: { commits: [{}, {}] } },
      { type: "WatchEvent", created_at: new Date().toISOString(), payload: {} },
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => events }));
    const data = await fetchGitHubActivity("octocat");
    expect(data.totalCommits).toBe(2);
    expect(data.perDay).toHaveLength(7);
  });

  it("throws a friendly error on 403 (rate limit)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 403 }));
    await expect(fetchGitHubActivity("octocat")).rejects.toThrow(/rate limit/i);
  });
});
