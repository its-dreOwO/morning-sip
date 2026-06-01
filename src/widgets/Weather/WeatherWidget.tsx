import { useEffect, useState } from "react";
import type { WidgetViewProps } from "../types";
import type { WidgetDataResult } from "../../data/types";
import { fetchWeather, type WeatherData } from "../../data/sources/weatherSource";

// Default location: London. Wire to geolocation later.
const LAT = 51.5072;
const LON = -0.1276;

// Animated condition glyph. Picks a CSS-animated SVG from the condition string
// (drops bounce, bolt pulses, cloud breathes, sun spins).
function WeatherIcon({ condition }: { condition: string }) {
  const norm = condition.toLowerCase();

  if (norm.includes("rain") || norm.includes("shower") || norm.includes("drizzle")) {
    return (
      <div className="relative" data-testid="weather-anim-rain">
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#ffc879" strokeWidth="2" strokeLinecap="round">
          <path d="M17 16.9a6 6 0 0 0 4-5.5 6 6 0 0 0-6-6 6 6 0 0 0-5.9 5" fill="rgba(255, 200, 121, 0.1)" />
        </svg>
        <div className="absolute bottom-1 left-3.5 flex gap-1.5">
          {[0, 0.3, 0.6].map((d) => (
            <div
              key={d}
              className="h-1.5 w-[1.5px] animate-bounce rounded-full bg-accent-amber"
              style={{ animationDelay: `${d}s`, animationDuration: "1s" }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (norm.includes("storm") || norm.includes("thunder")) {
    return (
      <div className="relative" data-testid="weather-anim-storm">
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#ffc879" strokeWidth="2">
          <path d="M19 16.9A5 5 0 0 0 18 7h-1.26a8 8 0 1 0-11.62 8.58" fill="rgba(255, 200, 121, 0.1)" />
        </svg>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffc879" stroke="#ffc879" strokeWidth="1" className="absolute bottom-0.5 left-4 animate-pulse">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </div>
    );
  }

  if (norm.includes("cloud") || norm.includes("overcast") || norm.includes("fog")) {
    return (
      <div data-testid="weather-anim-cloud">
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#ffc879" strokeWidth="2" className="animate-pulse" style={{ animationDuration: "4s" }}>
          <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42 0-.83.07-1.22.2A5 5 0 0 0 5 13c0 2.2 1.8 4 4 4" fill="rgba(255, 200, 121, 0.1)" />
        </svg>
      </div>
    );
  }

  return (
    <div data-testid="weather-anim-sun">
      <svg
        width="46"
        height="46"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ffc879"
        strokeWidth="2"
        className="animate-spin"
        style={{ animationDuration: "12s", filter: "drop-shadow(0 0 4px rgba(255, 200, 121, 0.3))" }}
      >
        <circle cx="12" cy="12" r="4" fill="rgba(255, 200, 121, 0.15)" />
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
        <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
        <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
      </svg>
    </div>
  );
}

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
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-accent-amber">{data.tempC}°</span>
            <span className="text-sm text-text-muted">{data.condition}</span>
          </div>
          <div className="text-xs text-text-muted">H{data.high}° L{data.low}°</div>
        </div>
        <WeatherIcon condition={data.condition} />
      </div>
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
