import { defineWidget, type WidgetDefinition } from "./types";
import { WeatherView, useWeatherData } from "./Weather/WeatherWidget";

export const registry: WidgetDefinition[] = [
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
