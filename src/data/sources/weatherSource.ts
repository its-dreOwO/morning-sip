export interface WeatherData {
  tempC: number;
  condition: string;
  high: number;
  low: number;
  nextHours: number[];
}

const CODE_MAP: Record<number, string> = {
  0: "Clear", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
  45: "Fog", 51: "Drizzle", 61: "Rain", 71: "Snow", 80: "Showers", 95: "Thunderstorm",
};

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code&hourly=temperature_2m` +
    `&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather request failed: ${res.status}`);
  const j = await res.json();
  return {
    tempC: Math.round(j.current.temperature_2m),
    condition: CODE_MAP[j.current.weather_code] ?? "Unknown",
    high: Math.round(j.daily.temperature_2m_max[0]),
    low: Math.round(j.daily.temperature_2m_min[0]),
    nextHours: (j.hourly.temperature_2m as number[]).slice(0, 6).map(Math.round),
  };
}
