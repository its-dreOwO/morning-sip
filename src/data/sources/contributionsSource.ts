// Full-year GitHub contribution calendar. The data needs an authenticated
// GraphQL call, so the token lives server-side in the Vite dev proxy at
// /api/contributions (see vite.config.ts) — never in the client bundle.

export type ContributionLevel = 0 | 1 | 2 | 3 | 4;

export interface ContributionDay {
  date: string;
  count: number;
  level: ContributionLevel;
}

export interface ContributionData {
  totalContributions: number;
  weeks: ContributionDay[][];
}

interface RawDay {
  date: string;
  contributionCount: number;
  contributionLevel: string;
}
interface RawCalendar {
  totalContributions: number;
  weeks: { contributionDays: RawDay[] }[];
}

const LEVELS: Record<string, ContributionLevel> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

export async function fetchContributions(): Promise<ContributionData> {
  let res: Response;
  try {
    res = await fetch("/api/contributions");
  } catch {
    throw new Error("Could not reach the contributions service.");
  }
  if (!res.ok) {
    throw new Error(`Could not load contributions (${res.status}).`);
  }
  const calendar: RawCalendar = await res.json();
  return {
    totalContributions: calendar.totalContributions,
    weeks: calendar.weeks.map((w) =>
      w.contributionDays.map((d) => ({
        date: d.date,
        count: d.contributionCount,
        level: LEVELS[d.contributionLevel] ?? 0,
      }))
    ),
  };
}
