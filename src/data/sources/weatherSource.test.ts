import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchWeather } from "./weatherSource";

beforeEach(() => vi.restoreAllMocks());

describe("fetchWeather", () => {
  it("maps Open-Meteo response into WeatherData", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: { temperature_2m: 18, weather_code: 2 },
        hourly: { temperature_2m: [17, 18, 19, 20, 21, 22] },
        daily: { temperature_2m_max: [21], temperature_2m_min: [11] },
      }),
    }));
    const data = await fetchWeather(1, 2);
    expect(data.tempC).toBe(18);
    expect(data.high).toBe(21);
    expect(data.low).toBe(11);
    expect(data.nextHours).toEqual([17, 18, 19, 20, 21, 22]);
    expect(data.condition).toMatch(/cloud/i);
  });

  it("throws on non-ok response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    await expect(fetchWeather(1, 2)).rejects.toThrow();
  });
});
