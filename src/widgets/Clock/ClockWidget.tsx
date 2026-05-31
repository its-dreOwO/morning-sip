import { useEffect, useState } from "react";
import type { WidgetViewProps } from "../types";
import type { WidgetDataResult } from "../../data/types";

export interface ClockData { time: string; date: string; }

export function ClockView({ data, state }: WidgetViewProps<ClockData>) {
  if (state !== "ready" || !data) return null;
  return (
    <div className="flex h-full flex-col justify-center">
      <span className="text-4xl font-bold leading-none text-text-bright">{data.time}</span>
      <span className="mt-1 text-sm text-text-muted">{data.date}</span>
    </div>
  );
}

export function useClockData(): WidgetDataResult<ClockData> {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return {
    state: "ready",
    data: {
      time: now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
      date: now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
    },
  };
}
