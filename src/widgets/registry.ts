import { defineWidget, type WidgetDefinition } from "./types";
import { ClockView, useClockData } from "./Clock/ClockWidget";
import { WeatherView, useWeatherData } from "./Weather/WeatherWidget";

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
];
