import { useEffect, useState } from "react";
import type { WidgetViewProps } from "../types";
import type { WidgetDataResult } from "../../data/types";
import { fetchWeather, type WeatherData } from "../../data/sources/weatherSource";

// Default location: London. Wire to geolocation later.
const LAT = 51.5072;
const LON = -0.1276;

export function WeatherView({ data, state }: WidgetViewProps<WeatherData>) {
  if (state !== "ready" || !data) return null;
  // Normalize to the visible range so sub-zero temps still produce valid bar
  // heights. Floor at 8% so a flat range still renders something.
  const min = Math.min(...data.nextHours);
  const max = Math.max(...data.nextHours);
  const span = max - min || 1;
  const barHeight = (t: number) => 8 + ((t - min) / span) * 92;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-accent-amber">{data.tempC}°</span>
        <span className="text-sm text-text-muted">{data.condition}</span>
      </div>
      <div className="text-xs text-text-muted">H{data.high}° L{data.low}°</div>
      <div className="flex h-12 items-end gap-1">
        {data.nextHours.map((t, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-accent-amber"
            style={{ height: `${barHeight(t)}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function useWeatherData(): WidgetDataResult<WeatherData> {
  const [result, setResult] = useState<WidgetDataResult<WeatherData>>({
    state: "loading",
    data: null,
  });
  useEffect(() => {
    let active = true;
    fetchWeather(LAT, LON)
      .then((d) => active && setResult({ state: "ready", data: d }))
      .catch(
        (e) =>
          active &&
          setResult({ state: "error", data: null, error: e instanceof Error ? e.message : String(e) })
      );
    return () => {
      active = false;
    };
  }, []);
  return result;
}
