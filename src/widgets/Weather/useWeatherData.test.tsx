import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

// Mock the data source so the hook is tested in isolation.
vi.mock("../../data/sources/weatherSource", () => ({
  fetchWeather: vi.fn(),
}));

import { useWeatherData } from "./WeatherWidget";
import { fetchWeather } from "../../data/sources/weatherSource";

const mockFetch = vi.mocked(fetchWeather);

beforeEach(() => vi.clearAllMocks());

describe("useWeatherData", () => {
  it("starts in loading state", () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useWeatherData());
    expect(result.current.state).toBe("loading");
    expect(result.current.data).toBeNull();
  });

  it("transitions to ready with data on success", async () => {
    mockFetch.mockResolvedValue({ tempC: 18, condition: "Clear", high: 21, low: 11, nextHours: [17, 18] });
    const { result } = renderHook(() => useWeatherData());
    await waitFor(() => expect(result.current.state).toBe("ready"));
    expect(result.current.data?.tempC).toBe(18);
  });

  it("transitions to error with the message on failure", async () => {
    mockFetch.mockRejectedValue(new Error("boom"));
    const { result } = renderHook(() => useWeatherData());
    await waitFor(() => expect(result.current.state).toBe("error"));
    expect(result.current.error).toBe("boom");
  });
});
