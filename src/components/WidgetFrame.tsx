import type { ReactNode } from "react";
import type { AccentName, WidgetState } from "../widgets/types";
import { Skeleton } from "./Skeleton";

const accentClass: Record<AccentName, string> = {
  amber: "text-accent-amber",
  teal: "text-accent-teal",
  coral: "text-accent-coral",
  violet: "text-accent-violet",
  green: "text-accent-green",
};

interface Props {
  title: string;
  accent: AccentName;
  state: WidgetState;
  error?: string;
  children: ReactNode;
}

export function WidgetFrame({ title, accent, state, error, children }: Props) {
  return (
    <div className="flex h-full w-full flex-col gap-2 rounded-2xl border border-white/10 bg-card p-4 shadow-lg">
      <div className="mb-2 flex flex-col gap-1.5 pb-1">
        <div className="flex items-baseline justify-between">
          <span className={`text-xs font-bold uppercase tracking-wider md:text-sm ${accentClass[accent]}`}>
            {title}
          </span>
        </div>
        {/* Dotted matrix divider — color comes from currentColor, set by the
            accent text class, so the palette stays sourced from Tailwind only. */}
        <div
          className={`dotted-rule h-[2px] w-full opacity-40 ${accentClass[accent]}`}
          style={{
            background: "radial-gradient(circle, currentColor 0%, transparent 100%)",
            backgroundSize: "6px 2px",
          }}
        />
      </div>
      <div className="widget-content-body flex-1 overflow-auto text-text-bright">
        {state === "loading" && <Skeleton />}
        {state === "error" && <p className="text-sm text-accent-coral">{error ?? "Something went wrong"}</p>}
        {state === "empty" && <p className="text-sm text-text-muted">Nothing here yet.</p>}
        {state === "ready" && children}
      </div>
    </div>
  );
}
