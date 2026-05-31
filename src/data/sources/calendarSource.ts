// MOCK. Replace with Google Calendar API later — return the same CalendarEvent[] shape.
export interface CalendarEvent { id: string; time: string; title: string; }

export function getMockEvents(): CalendarEvent[] {
  return [
    { id: "1", time: "9:30", title: "Standup" },
    { id: "2", time: "11:00", title: "Design review" },
    { id: "3", time: "15:00", title: "1:1 with Sam" },
  ];
}
