import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchContributions } from "./contributionsSource";

const calendarFixture = {
  totalContributions: 3,
  weeks: [
    {
      contributionDays: [
        { date: "2025-06-01", contributionCount: 0, contributionLevel: "NONE" },
        { date: "2025-06-02", contributionCount: 1, contributionLevel: "FIRST_QUARTILE" },
      ],
    },
    {
      contributionDays: [
        { date: "2025-06-08", contributionCount: 9, contributionLevel: "FOURTH_QUARTILE" },
      ],
    },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchContributions", () => {
  it("maps the GraphQL calendar into weeks of {date,count,level} with numeric levels", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => calendarFixture })
    );

    const data = await fetchContributions();

    expect(data.totalContributions).toBe(3);
    expect(data.weeks).toHaveLength(2);
    expect(data.weeks[0][1]).toEqual({ date: "2025-06-02", count: 1, level: 1 });
    expect(data.weeks[1][0]).toEqual({ date: "2025-06-08", count: 9, level: 4 });
  });

  it("throws a friendly error when the proxy responds non-ok", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })
    );

    await expect(fetchContributions()).rejects.toThrow(/contribution/i);
  });
});
