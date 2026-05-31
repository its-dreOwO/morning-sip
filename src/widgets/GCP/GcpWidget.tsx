import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import type { WidgetViewProps } from "../types";
import type { WidgetDataResult } from "../../data/types";
import { getMockGcp, type GcpData } from "../../data/sources/gcpSource";

const COLORS = ["#5fe0c8", "#c2a6ff", "#ffc879"];

export function GcpView({ data, state }: WidgetViewProps<GcpData>) {
  if (state !== "ready" || !data) return null;
  const pct = Math.round((data.spend / data.budget) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="h-20 w-20">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data.breakdown} dataKey="value" innerRadius={22} outerRadius={34} paddingAngle={2}>
              {data.breakdown.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold text-accent-teal">${data.spend}</span>
        <span className="text-xs text-text-muted">{pct}% of ${data.budget}</span>
      </div>
    </div>
  );
}

export function useGcpData(): WidgetDataResult<GcpData> {
  return { state: "ready", data: getMockGcp() };
}
