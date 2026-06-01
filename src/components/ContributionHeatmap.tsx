import type { ContributionDay, ContributionLevel } from "../data/sources/contributionsSource";

interface Props {
  weeks: ContributionDay[][];
  total: number;
}

// Theme-green ramp keyed by contribution level. Level 0 is a faint surface
// tint; 1–4 climb the accent-green family.
const levelColor: Record<ContributionLevel, string> = {
  0: "bg-white/5",
  1: "bg-accent-green/25",
  2: "bg-accent-green/50",
  3: "bg-accent-green/75",
  4: "bg-accent-green",
};

const LEGEND_LEVELS: ContributionLevel[] = [0, 1, 2, 3, 4];

export function ContributionHeatmap({ weeks, total }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs text-text-muted">
        <span className="font-bold text-text-bright">{total}</span> contributions in the last year
      </div>
      <div className="flex gap-[3px] overflow-x-auto">
        {weeks.map((days, w) => (
          <div key={w} className="flex flex-col gap-[3px]">
            {days.map((day) => (
              <span
                key={day.date}
                data-contrib-cell
                data-level={day.level}
                title={`${day.count} on ${day.date}`}
                className={`h-[11px] w-[11px] rounded-[2px] ${levelColor[day.level]}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 self-end text-[10px] text-text-muted">
        <span>Less</span>
        {LEGEND_LEVELS.map((l) => (
          <span key={l} className={`h-[10px] w-[10px] rounded-[2px] ${levelColor[l]}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
