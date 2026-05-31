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
    <div className="flex h-full w-full flex-col gap-2 rounded-2xl border border-white/10 bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-text-muted">{title}</span>
      </div>
      <div className={`flex-1 overflow-auto ${accentClass[accent]}`}>
        {state === "loading" && <Skeleton />}
        {state === "error" && <p className="text-sm text-accent-coral">{error ?? "Something went wrong"}</p>}
        {state === "empty" && <p className="text-sm text-text-muted">Nothing here yet.</p>}
        {state === "ready" && children}
      </div>
    </div>
  );
}
