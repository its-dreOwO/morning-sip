import { defineWidget, type WidgetDefinition } from "./types";
import { ClockView, useClockData } from "./Clock/ClockWidget";
import { WeatherView, useWeatherData } from "./Weather/WeatherWidget";
import { TodosView, useTodosData } from "./Todos/TodosWidget";
import { GitHubView, useGitHubData } from "./GitHub/GitHubWidget";
import { CalendarView, useCalendarData } from "./Calendar/CalendarWidget";
import { MailView, useMailData } from "./Mail/MailWidget";

export const registry: WidgetDefinition[] = [
  defineWidget({
    id: "clock",
    name: "Clock",
    accent: "amber",
    defaultSize: { w: 2, h: 1 },
    minSize: { w: 2, h: 1 },
    Component: ClockView,
    useData: useClockData,
  }),
  defineWidget({
    id: "weather",
    name: "Weather",
    accent: "amber",
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    Component: WeatherView,
    useData: useWeatherData,
  }),
  defineWidget({
    id: "todos",
    name: "Todos",
    accent: "green",
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    Component: TodosView,
    useData: useTodosData,
  }),
  defineWidget({
    id: "github",
    name: "GitHub",
    accent: "amber",
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    Component: GitHubView,
    useData: useGitHubData,
  }),
  defineWidget({
    id: "calendar",
    name: "Calendar",
    accent: "violet",
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    Component: CalendarView,
    useData: useCalendarData,
  }),
  defineWidget({
    id: "mail",
    name: "Mail",
    accent: "coral",
    defaultSize: { w: 2, h: 2 },
    minSize: { w: 2, h: 2 },
    Component: MailView,
    useData: useMailData,
  }),
];
