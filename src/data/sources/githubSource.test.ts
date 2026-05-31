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

  it("does NOT count an out-of-window PushEvent toward totalCommits or perDay", async () => {
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
    const events = [
      { type: "PushEvent", created_at: tenDaysAgo.toISOString(), payload: { commits: [{}, {}, {}] } },
      { type: "PushEvent", created_at: new Date().toISOString(), payload: { commits: [{}] } },
    ];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => events }));
    const data = await fetchGitHubActivity("octocat");
    // Only the today event (1 commit) should count; the 10-days-ago event (3 commits) must not.
    expect(data.totalCommits).toBe(1);
    const bucketTotal = data.perDay.reduce((sum, d) => sum + d.commits, 0);
    expect(bucketTotal).toBe(1);
  });

  it("throws a friendly error on 403 (rate limit)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 403 }));
    await expect(fetchGitHubActivity("octocat")).rejects.toThrow(/rate limit/i);
  });

  it("serves the second call from the 10-minute localStorage cache (fetch called once)", async () => {
    const events = [
      { type: "PushEvent", created_at: new Date().toISOString(), payload: { commits: [{}] } },
    ];
    const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => events });
    vi.stubGlobal("fetch", mockFetch);

    const first = await fetchGitHubActivity("octocat");
    const second = await fetchGitHubActivity("octocat");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
  });
});
