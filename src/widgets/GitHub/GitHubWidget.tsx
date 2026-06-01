import { useEffect, useState } from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import type { WidgetViewProps } from "../types";
import type { WidgetDataResult } from "../../data/types";
import { fetchGitHubActivity, type GitHubData } from "../../data/sources/githubSource";
import { fetchContributions, type ContributionData } from "../../data/sources/contributionsSource";
import { AnimatedNumber } from "../../components/AnimatedNumber";
import { ContributionHeatmap } from "../../components/ContributionHeatmap";

const GITHUB_USER = "octocat"; // change to your username

export function GitHubView({ data, state, expanded }: WidgetViewProps<GitHubData>) {
  if (state !== "ready" || !data) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-2xl font-bold text-accent-amber">
        <AnimatedNumber value={data.totalCommits} />
      </span>
      <span className="text-xs text-text-muted">commits this week</span>
      <div className="h-12">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 240, height: 48 }}>
          <AreaChart data={data.perDay}>
            <Area type="monotone" dataKey="commits" stroke="#ffc879" fill="#ffc87955" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      {expanded && (
        <div className="mt-4">
          <GitHubContributions />
        </div>
      )}
    </div>
  );
}

// Mounted only in the expanded overlay, so the authenticated calendar is
// fetched lazily — never on a collapsed widget's initial render.
function GitHubContributions() {
  const result = useContributionsData();
  if (result.state === "loading") return <p className="text-xs text-text-muted">Loading contributions…</p>;
  if (result.state === "error") return <p className="text-xs text-accent-coral">{result.error}</p>;
  if (!result.data) return null;
  return <ContributionHeatmap weeks={result.data.weeks} total={result.data.totalContributions} />;
}

function useContributionsData(): WidgetDataResult<ContributionData> {
  const [result, setResult] = useState<WidgetDataResult<ContributionData>>({ state: "loading", data: null });
  useEffect(() => {
    let active = true;
    fetchContributions()
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
