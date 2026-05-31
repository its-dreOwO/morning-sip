import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import type { WidgetViewProps } from "../types";
import type { WidgetDataResult } from "../../data/types";
import { fetchGitHubActivity, type GitHubData } from "../../data/sources/githubSource";

const GITHUB_USER = "octocat"; // change to your username

export function GitHubView({ data, state }: WidgetViewProps<GitHubData>) {
  if (state !== "ready" || !data) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-2xl font-bold text-accent-amber">{data.totalCommits}</span>
      <span className="text-xs text-text-muted">commits this week</span>
      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data.perDay}>
            <Area type="monotone" dataKey="commits" stroke="#ffc879" fill="#ffc87955" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function useGitHubData(): WidgetDataResult<GitHubData> {
  const [result, setResult] = useState<WidgetDataResult<GitHubData>>({ state: "loading", data: null });
  useEffect(() => {
    let active = true;
    fetchGitHubActivity(GITHUB_USER)
      .then((d) => active && setResult({ state: "ready", data: d }))
      .catch(
        (e) =>
          active &&
          setResult({ state: "error", data: null, error: e instanceof Error ? e.message : String(e) })
      );
    return () => { active = false; };
  }, []);
  return result;
}
