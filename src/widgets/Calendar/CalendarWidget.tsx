import type { WidgetViewProps } from "../types";
import type { WidgetDataResult } from "../../data/types";
import { getMockEvents, type CalendarEvent } from "../../data/sources/calendarSource";

export interface CalendarData { events: CalendarEvent[]; }

export function CalendarView({ data, state }: WidgetViewProps<CalendarData>) {
  if (state !== "ready" || !data) return null;
  return (
    <ul className="flex flex-col gap-2">
      {data.events.map((e) => (
        <li key={e.id} className="flex items-baseline gap-3">
          <span className="text-sm font-semibold text-accent-violet">{e.time}</span>
          <span className="text-sm text-text-bright">{e.title}</span>
        </li>
      ))}
    </ul>
  );
}

export function useCalendarData(): WidgetDataResult<CalendarData> {
  const events = getMockEvents();
  return { state: events.length ? "ready" : "empty", data: { events } };
}
