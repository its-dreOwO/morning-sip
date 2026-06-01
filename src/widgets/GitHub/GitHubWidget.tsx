import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import type { WidgetViewProps } from "../types";
import type { WidgetDataResult } from "../../data/types";
import {
  fetchContributions,
  type ContributionDay,
} from "../../data/sources/contributionsSource";
import { AnimatedNumber } from "../../components/AnimatedNumber";
import { ContributionHeatmap } from "../../components/ContributionHeatmap";

// The whole widget is driven by the authenticated contribution calendar (same
// source as the heatmap), so the weekly number and sparkline include private
// repos and stay consistent with the year view. The unauthenticated public
// events API was dropped: its payload is stripped of commit counts, so it could
// only ever report 0.
export interface GitHubData {
  weekTotal: number;
  perDay: { day: string; commits: number }[];
  weeks: ContributionDay[][];
  yearTotal: number;
}

export function GitHubView({ data, state }: WidgetViewProps<GitHubData>) {
  if (state !== "ready" || !data) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-2xl font-bold text-accent-amber">
        <AnimatedNumber value={data.weekTotal} />
      </span>
      <span className="text-xs text-text-muted">contributions this week</span>
      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 240, height: 48 }}>
          <AreaChart data={data.perDay}>
            <Area type="monotone" dataKey="commits" stroke="#ffc879" fill="#ffc87955" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4">
        <ContributionHeatmap weeks={data.weeks} total={data.yearTotal} />
      </div>
    </div>
  );
}

export function useGitHubData(): WidgetDataResult<GitHubData> {
  const [result, setResult] = useState<WidgetDataResult<GitHubData>>({ state: "loading", data: null });
  useEffect(() => {
    let active = true;
    fetchContributions()
      .then((cal) => {
        if (!active) return;
        const days = cal.weeks.flatMap((w) => w);
        const last7 = days.slice(-7);
        const perDay = last7.map((d) => ({
          day: new Date(d.date).toLocaleDateString(undefined, { weekday: "short" }),
          commits: d.count,
        }));
        const weekTotal = last7.reduce((sum, d) => sum + d.count, 0);
        setResult({
          state: "ready",
          data: { weekTotal, perDay, weeks: cal.weeks, yearTotal: cal.totalContributions },
        });
      })
      .catch(
        (e) =>
          active &&
          setResult({ state: "error", data: null, error: e instanceof Error ? e.message : String(e) })
      );
    return () => { active = false; };
  }, []);
  return result;
}
